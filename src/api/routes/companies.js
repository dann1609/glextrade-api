const { Router } = require('express');
const { Auth } = require('../middlewares');
const { Company } = require('../../models/company');
const { Relationship, relationTypes } = require('../../models/relationship');
const { GlextradeEvent, eventTypes, getDefaultCompanyEventParams } = require('../../models/glextradeEvent');
const { ChatRoom } = require('../../models/chatRoom');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const profileSeenEvent = (currentCompany, company) => {
  const eventParams = getDefaultCompanyEventParams(eventTypes.SEEN_PROFILE,
    currentCompany, company);

  const event = new GlextradeEvent(eventParams);

  event.save();
};


const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('name country industry type coverUrl profileUrl');
    return res.send({ companies });
  } catch (error) {
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
};

const updateCompany = async (req, res) => {
  const queryObject = req.body;
  const { currentUser } = req;
  const { company } = currentUser;

  Object.assign(company, queryObject);

  try {
    const savedCompany = await company.save();

    res.send(savedCompany);
  } catch (error) {
    console.error(error);
    ApiHelper.statusInternalServerError(res, error.message);
  }
};

const getMyCompany = async (req, res) => {
  const { currentUser } = req;
  const currentCompany = currentUser.company;

  const company = await currentCompany.populate('network.relation').execPopulate();

  return res.send(company);
};

const getCompany = async (req, res) => {
  const { id } = req.params;
  const { currentUser } = req;
  const currentCompany = currentUser.company;
  const profileView = req.query.profile_view;

  const company = await Company.findOne({ _id: id }).populate('network.relation');

  if (company) {
    if (profileView && currentCompany.id !== id) {
      profileSeenEvent(currentCompany, company);
    }

    // eslint-disable-next-line eqeqeq
    const ourRelation = company.network.find(
      // eslint-disable-next-line eqeqeq
      (connection) => connection.company == currentCompany.id,
    );

    company.network = null;
    company.ourRelation = ourRelation;

    return res.send(company);
  }
  return ApiHelper.statusNotFound(res, 'Company not found');
};

const connectWithCompany = async (req, res) => {
  const { id } = req.params;
  const { currentUser } = req;
  const currentCompany = currentUser.company;

  const company = await Company.findOne({ _id: id }).populate('network.relation');

  if (company) {
    // eslint-disable-next-line no-dupe-keys
    let relation = await Relationship.findOne({
      member: { $all: [currentCompany.id, company.id] },
    });

    console.log(relation);

    if (!relation) {
      relation = new Relationship({
        member: [
          currentCompany.id,
          company.id,
        ],
        type: relationTypes.INVITATION_SEND,
        sender: currentCompany.id,
      });

      company.network.push({
        company: currentCompany.id,
        relation,
      });

      currentCompany.network.push({
        company: company.id,
        relation,
      });

      try {
        await relation.save();
        await currentCompany.save();
        await company.save();

        const eventParams = getDefaultCompanyEventParams(eventTypes.CONNECTION_REQUEST,
          currentCompany, company);
        const event = new GlextradeEvent(eventParams);

        event.save();
      } catch (error) {
        console.error(error);
        return ApiHelper.statusInternalServerError('connection error');
      }
      // eslint-disable-next-line eqeqeq
    } else if (relation.type === relationTypes.INVITATION_SEND && relation.sender == company.id) {
      console.log('inside');
      relation.type = relationTypes.CONNECTED;
      relation.sender = null;

      const chatRoom = new ChatRoom();
      await chatRoom.save();
      relation.chatRoom = chatRoom;
      await relation.save();

      const eventParams = getDefaultCompanyEventParams(eventTypes.CONNECTION_ACCEPTED,
        currentCompany, company);
      const event = new GlextradeEvent(eventParams);

      event.save();
    }

    console.log(company.network, currentCompany.id);

    const ourRelation = company.network.find(
      // eslint-disable-next-line eqeqeq
      (connection) => connection.company == currentCompany.id,
    );

    console.log(ourRelation);

    ourRelation.relation = relation;

    company.network = null;
    company.ourRelation = ourRelation;

    return res.send(company);
  }
  return ApiHelper.statusNotFound(res, 'Company not found');
};

const disconnectWithCompany = async (req, res) => {
  const { id } = req.params;
  const { currentUser } = req;
  const currentCompany = currentUser.company;

  const company = await Company.findOne({ _id: id });

  if (company) {
    // eslint-disable-next-line no-dupe-keys
    const relation = await Relationship.findOne({ member: currentCompany.id, member: company.id });

    if (relation) {
      currentCompany.network = currentCompany.network
      // eslint-disable-next-line eqeqeq
        .filter((connection) => connection.relation != relation.id);
      // eslint-disable-next-line eqeqeq
      company.network = company.network.filter((connection) => connection.relation != relation.id);

      try {
        await currentCompany.save();
        await company.save();
        await relation.delete();
      } catch (error) {
        console.error(error);
        return ApiHelper.statusInternalServerError(res, 'connection error');
      }
    }

    return res.send({
      success: true,
    });
  }

  return ApiHelper.statusNotFound(res, 'Company not found');
};

const linkRoute = (app, path) => {
  app.use(path, route);
  route.get('/', Auth.isAuth, listCompanies);
  route.get('/my_company', Auth.needAuth, getMyCompany);
  route.put('/my_company', Auth.needAuth, updateCompany);
  route.get('/:id', Auth.needAuth, getCompany);
  route.put('/:id', Auth.needAuth, connectWithCompany);
  route.delete('/:id', Auth.needAuth, disconnectWithCompany);
};

module.exports = {
  linkRoute,
};

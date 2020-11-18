const { Router } = require('express');
const { Auth } = require('../middlewares');
const { Company } = require('../../models/company');
const { Relationship, relationTypes } = require('../../models/relationship');
const { GlextradeEvent, eventTypes, getDefaultCompanyEventParams } = require('../../models/glextradeEvent');
const { ChatRoom } = require('../../models/chatRoom');
const { receiveVideo, processVideo } = require('./s3');
const ApiHelper = require('../../helpers/apiHelper');
const socketIO = require('../../loaders/socketIO');

const route = Router();

const profileSeenEvent = async (currentCompany, company) => {
  const eventParams = getDefaultCompanyEventParams(eventTypes.SEEN_PROFILE,
    currentCompany, company);

  const event = new GlextradeEvent(eventParams);

  await event.saveAndSend();
};


const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({profileUrl: -1, coverUrl: -1, videoUrl: -1}).select('name country industry type coverUrl profileUrl');
    return res.send({ companies });
  } catch (error) {
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
};

const amountOfCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('name country industry type coverUrl profileUrl');
    return res.send({ registeredCompanies: companies.length });
  } catch (error) {
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
};

const updateCompany = async (req, res) => {
  const queryObject = req.body;
  const { currentUser, avoidReturn } = req;
  const { company } = currentUser;

  Object.assign(company, queryObject);

  try {
    const savedCompany = await company.save();

    !avoidReturn && res.send(savedCompany);
  } catch (error) {
    console.error(error);
    !avoidReturn && ApiHelper.statusInternalServerError(res, error.message);
  }
};

const updateProfileVideo = async (req, res, next) => {
  const { videoUrl, currentUser } = req;
  const currentCompany = currentUser.company;

  const body = {
    videoUrl: videoUrl || currentUser.company.videoUrl,
    uploadingVideo: false,
  };

  req.body = body;
  req.avoidReturn = true;

  socketIO.emitToCompany(currentCompany, socketIO.EVENTS.VIDEO_UPDATED, body);

  next();
};

const updateExtraPicture = async (req, res, next) => {
  const { currentUser } = req;
  const { position } = req.params;
  const queryObject = req.body;
  const currentCompany = currentUser.company;

  const extraPictures = currentCompany.extraUrl;

  const { url } = queryObject;

  if (url) {
    if (extraPictures.length < 6) {
      extraPictures.push({
        id: Date.now(),
        url,
      });
    } else {

    }
  } else {
    extraPictures.splice(position, 1);
  }

  next();
};

const onProcessVideo = async (req, res, next) => {
  const { currentUser } = req;
  const currentCompany = currentUser.company;

  currentCompany.uploadingVideo = true;

  const savedCompany = await currentCompany.save();

  res.send(savedCompany);

  next();
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

        event.saveAndSend();
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

      event.saveAndSend();
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
        .filter((connection) => connection.relation != relation.id);
      company.network = company.network
        .filter((connection) => connection.relation != relation.id);

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
  route.get('/', listCompanies);
  route.get('/amount', amountOfCompanies);
  route.get('/my_company', Auth.needAuth, getMyCompany);
  route.post('/update_profile_video', Auth.needAuth, receiveVideo, onProcessVideo, processVideo, updateProfileVideo, updateCompany);
  route.put('/update_extra_picture/:position?', Auth.needAuth, updateExtraPicture, updateCompany);
  route.put('/my_company', Auth.needAuth, updateCompany);
  route.get('/:id', Auth.needAuth, getCompany);
  route.put('/:id', Auth.needAuth, connectWithCompany);
  route.delete('/:id', Auth.needAuth, disconnectWithCompany);
};

module.exports = {
  linkRoute,
};

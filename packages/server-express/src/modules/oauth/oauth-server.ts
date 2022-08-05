import OAuth2Server from 'oauth2-server';
import {
  getAccessToken,
  getClient,
  getRefreshToken,
  getUser,
  saveToken,
  revokeToken,
  verifyScope,
} from './oauth.service';

/**
 * oauth model
 * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#
 */
const model = {
  getAccessToken,
  getClient,
  getRefreshToken,
  getUser,
  saveToken,
  revokeToken,
  verifyScope,
};

/**
 * oauth2Server
 */
const oauth = new OAuth2Server({
  model: model,
  accessTokenLifetime: 7 * 24 * 3600,
  refreshTokenLifetime: 7 * 24 * 3600,
  requireClientAuthentication: {
    password: false,
  },
});

export default oauth;

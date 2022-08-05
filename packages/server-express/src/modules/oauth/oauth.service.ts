import {
  Token,
  RefreshToken,
  PasswordModel,
  RefreshTokenModel,
} from 'oauth2-server';
import { AppDataSource } from 'src/app/data-source';
import { OAuth } from '@toys/common/entity/OAuth';
import { User } from '@toys/common/entity/User';

const authRepository = AppDataSource.getRepository(OAuth);
const userRepository = AppDataSource.getRepository(User);

/**
 * getAccessToken
 * @param bearerToken
 * @returns Promise<Token | null>
 */
export const getAccessToken: PasswordModel['getAccessToken'] = async (
  bearerToken: string
) => {
  const oauth = await authRepository.findOneBy({
    accessToken: bearerToken,
  });
  if (oauth) {
    const token: Token = {
      accessToken: oauth.accessToken,
      accessTokenExpiresAt: oauth.accessTokenExpiresAt,
      client: {
        id: oauth.clientId,
        grants: ['password'],
      },
      user: {
        id: oauth.userId,
      },
    };
    return token;
  }
  return false;
};

/**
 * getClient
 * @param clientId
 * @param clientSecret
 * @returns clientObj
 */
export const getClient: PasswordModel['getClient'] = async (
  clientId: string,
  clientSecret: string | null
) => {
  const result = {
    id: clientId,
    grants: ['password'],
  };
  return result;
};

/**
 * getRefreshToken
 * @param refreshToken
 * @returns Promise<RefreshToken | false>
 */
export const getRefreshToken: RefreshTokenModel['getRefreshToken'] = async (
  refreshToken: string
) => {
  const oauth = await authRepository.findOneBy({
    refreshToken,
  });
  if (oauth) {
    const refreshToken: RefreshToken = {
      refreshToken: oauth.refreshToken,
      refreshTokenExpiresAt: oauth.refreshTokenExpiresAt,
      client: {
        id: oauth.clientId,
        grants: ['password'],
      },
      user: {
        id: oauth.userId,
      },
    };
    return refreshToken;
  }
  return false;
};

/**
 * getUser
 * @param username
 * @param password
 * @returns User
 */
export const getUser: PasswordModel['getUser'] = async (
  username: string,
  password: string
) => {
  const user = await userRepository.findOneBy({
    name: username,
    password,
  });
  if (user) {
    const { password, ...tUser } = user;
    return tUser;
  }
  return false;
};

/**
 * saveToken
 * @param token
 * @param client
 * @param user
 * @returns Token
 */
export const saveToken: PasswordModel['saveToken'] = async (
  token,
  client,
  user: User
) => {
  const auth: OAuth = new OAuth();
  auth.accessToken = token.accessToken;
  auth.accessTokenExpiresAt = token.accessTokenExpiresAt || new Date();
  auth.clientId = client.id;
  auth.refreshToken = token.refreshToken || '';
  auth.refreshTokenExpiresAt = token.refreshTokenExpiresAt || new Date();
  auth.userId = user.id;

  await authRepository.save(auth);
  token.client = client;
  token.user = user;
  return token;
};

/**
 * revokeToken
 */
export const revokeToken: RefreshTokenModel['revokeToken'] = async token => {
  const result = await authRepository.delete({
    refreshToken: token.refreshToken,
  });
  return !!result.affected;
};

/**
 * verifyScope
 * @param token
 * @param scope
 * @returns
 */
export const verifyScope: PasswordModel['verifyScope'] = async (
  token,
  scope
) => {
  return true;
};

/** token 是否已过期
 * @param token
 * @returns {bool | undefined} 是否过期
 */
export const isTokenNotExpires = (token: Token) => {
  return (
    token &&
    token.accessTokenExpiresAt &&
    Date.now() - token.accessTokenExpiresAt.getTime() < 0
  );
};

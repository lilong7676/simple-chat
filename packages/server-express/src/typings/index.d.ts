/** express 相关 */
declare namespace Express {
  export interface Request {
    /** 如果请求的token有效，则为 token 代表的用户 id */
    userId: string;
  }
}

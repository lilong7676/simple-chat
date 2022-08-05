/**
 * 定义后台接口返回数据类型规范
 */
export interface ApiResult<D = Record<string, any> | any[]> {
  code: number;
  message: string;
  data: D;
}

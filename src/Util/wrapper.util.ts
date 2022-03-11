import { HttpException, HttpStatus } from "@nestjs/common";
import { MongoError } from "mongodb";

export async function asyncMongoWrapper<ParamType, ReturnType>(
  func: (param?: ParamType) => ReturnType,
  param?: ParamType,
) {
  try {
    console.log("wrapper function fires inner function");
    return await func(param);
  } catch (error) {
    console.log("wrapper function found some exception");
    throw error;
  }
}

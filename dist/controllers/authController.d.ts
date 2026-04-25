import { Request, Response } from "express";
export declare const sendOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserInfo: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map
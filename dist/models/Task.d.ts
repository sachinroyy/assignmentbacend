import mongoose, { Document } from "mongoose";
export interface ITask extends Document {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    status: "Pending" | "In Progress" | "Completed";
    dueDate: Date | null;
    userId: mongoose.Types.ObjectId;
}
declare const _default: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, mongoose.DefaultSchemaOptions> & ITask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITask>;
export default _default;
//# sourceMappingURL=Task.d.ts.map
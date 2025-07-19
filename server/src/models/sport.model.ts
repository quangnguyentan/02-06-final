import { Schema, model, Document } from "mongoose";

// Interface để định nghĩa cấu trúc của một document Sport
// Nó kế thừa Document của Mongoose để có các thuộc tính như _id, createdAt, etc.
export interface ISport extends Document {
  name: string;
  slug: string;
  icon?: string; // Dấu '?' cho biết thuộc tính này là tùy chọn
  order: number; // Thứ tự hiển thị
}

const sportSchema = new Schema<ISport>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
    },
    order: { type: Number, default: 0 }, // Mới thêm
  },
  {
    timestamps: true,
  }
);

// `model<ISport>` sẽ trả về một Model được typed với interface ISport
export default model<ISport>("Sport", sportSchema);

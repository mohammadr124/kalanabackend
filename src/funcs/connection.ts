import mongoose from "mongoose";

const connectToDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    await mongoose.connect(`${process.env.DATA_BASE_URL}/shop`)
  } catch (error) {
    console.log('error in connect to db func ======>', error);
    return "خطا دراتصال به دیتا بیس"
  }
};

export default connectToDb
import jwt from "jsonwebtoken";

export const tokenGenerator = (email: string) => {
  const key = process.env.SECRET_KEY;
  if (!key) {
    console.log("خطا در ساخت توکت");
    return;
  }
  const token = jwt.sign({ email }, key, 
    {
      expiresIn: "7d",
      algorithm: "HS256",
    },
  );
  return token;
};

export const verifyToken = (token: string) => {
  try {
    const key = process.env.SECRET_KEY;
    if (!key) {
      console.log("خطا در ساخت توکن");
      return;
    }
    const tokenInfo = jwt.verify(token, key);
    return tokenInfo
  } catch (error) {
    console.log("error in veify token func ===>", error);
  }
};

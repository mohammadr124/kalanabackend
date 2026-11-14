import express from "express";
import uploader from "../middleware/multer.js";
import {
  hasAccessForCreateBrand,
  hasAccessForUpdateBrandInfo,
  isAccessForDeleteBrands,
  isAccessForGetBrands,
} from "../middleware/brandMiddlware.js";
import {
  createBrandFunc,
  deleteBrand,
  getBrand,
  updateFunc,
} from "../controller/brandCotroller.js";

const brandRouter = express.Router();

brandRouter.post(
  "/create",
  uploader.single("image"),
  hasAccessForCreateBrand,
  createBrandFunc,
);

brandRouter.get("/get-all-brands", isAccessForGetBrands, getBrand);
brandRouter.delete("/delete-brand/:id", isAccessForDeleteBrands, deleteBrand);

brandRouter.put(
  "/update-brand/:id",
  uploader.single("image"),
  hasAccessForUpdateBrandInfo,
  updateFunc,
);

export default brandRouter;

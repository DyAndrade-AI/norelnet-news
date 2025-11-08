import { MenuService } from "../services/menuService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Solo enruta la petición al servicio que arma el menú completo.

export const getMenu = asyncHandler(async(_req,res)=>{
  const data = await MenuService.getMenu();
  res.json(data);
});

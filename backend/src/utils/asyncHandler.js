// Envoltorio estándar para propagar errores async hacia Express sin repetir try/catch
export const asyncHandler = (fn)=>(req, res, next) => Promise.resolve(fn(req,res,next)).catch(next);

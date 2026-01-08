export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;

  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err);
  } else {
    console.warn(`[WARN] ${req.method} ${req.originalUrl} -> ${status}: ${message}`);
  }

  res.status(status).json({ error: { message, ...(details && { details }) } });
}

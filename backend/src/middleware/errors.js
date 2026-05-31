export const notFound = (req, res) => {
  res.status(404).json({ detail: 'Not found' })
}

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error)

  if (!error.status || error.status >= 500) console.error(error)
  return res.status(error.status || 500).json({
    detail: error.status ? error.message : 'Internal server error',
  })
}

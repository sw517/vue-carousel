export default function isTrue(val) {
  switch (typeof val) {
    case 'string':
      return val !== 'false' && val.length
    case 'object':
      if (Array.isArray(val)) return val.length
      return Object.keys(val)
    default:
      return val
  }
}

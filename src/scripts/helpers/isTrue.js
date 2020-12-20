/**
 * Function to allow values normally seen as truthy to be
 * returned as false. E.g string "false" will be returned as false
 * instead of native truthy value.
 * @param {*} val Value to test as truthy
 */
export default function isTrue(val = null) {
  switch (typeof val) {
    case 'string':
      return val !== 'false' && !!val.length
    case 'object':
      if (Array.isArray(val)) return !!val.length
      else if (val === null) return false
      return !!Object.keys(val).length
    default:
      return !!val
  }
}

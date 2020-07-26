export default function isTrue(val) {
  return (
    (typeof val === 'boolean' && val === true) || val === 'true' || val === 1
  );
}

import { cross, inv, multiply } from 'mathjs'


/** Generates a UUID-derived DICOM UID with root `2.25`.
 *
 * @returns {string} Unique identifier
 * @private
 */
function generateUID() {
  /**
   * A UUID can be represented as a single integer value.
   * http://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_B.2.html
   * https://www.itu.int/rec/T-REC-X.667-201210-I/en
   * To obtain the single integer value of the UUID, the 16 octets of the
   * binary representation shall be treated as an unsigned integer encoding
   * with the most significant bit of the integer encoding as the most
   * significant bit (bit 7) of the first of the sixteen octets (octet 15) and
   * the least significant bit as the least significant bit (bit 0) of the last
   * of the sixteen octets (octet 0).
   */
  // FIXME: This is not a valid UUID!
  let uid = '2.25.' + Math.floor(1 + Math.random() * 9);
  while (uid.length < 44) {
    uid += Math.floor(1 + Math.random() * 10);
  }
  return uid;
}


/** Maps 2D (Column, Row) image coordinate in the Total Pixel Matrix
 * to 3D (X, Y, Z) slide coordinates in the Frame of Reference.
 *
 * @param {Object} options - Options
 * @param {Array} options.offset - X and Y offset in the slide coordinate system
 * @param {Array} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {Array} options.spacing - Spacing between pixels along the Column and Row direction of the Total Pixel Matrix
 * @param {Array} options.piont - Column and Row position of the point in the Total Pixel Matrix
 * @returns {Array} X, Y and Z position of the point in the slide coordinate system
 * @memberof utils
 */
function mapPixelCoordToSlideCoord(options) {
    // X and Y Offset in Slide Coordinate System
    if (!('offset' in options) ) {
        throw new Error('Option "offset" is required.');
    }
    if (!(Array.isArray(options.offset))) {
        throw new Error('Option "offset" must be an array.');
    }
    if (options.offset.length !== 2) {
        throw new Error('Option "offset" must be an array with 2 elements.');
    }
    const offset = options.offset;

    // Image Orientation Slide with direction cosines for Row and Column direction
    if (!('orientation' in options) ) {
        throw new Error('Option "orientation" is required.');
    }
    if (!(Array.isArray(options.orientation))) {
        throw new Error('Option "orientation" must be an array.');
    }
    if (options.orientation.length !== 6) {
        throw new Error('Option "orientation" must be an array with 6 elements.');
    }
    const orientation = options.orientation;

    // Pixel Spacing along the Row and Column direction
    if (!('spacing' in options) ) {
        throw new Error('Option "spacing" is required.');
    }
    if (!(Array.isArray(options.spacing))) {
        throw new Error('Option "spacing" must be an array.');
    }
    if (options.spacing.length !== 2) {
        throw new Error('Option "spacing" must be an array with 2 elements.');
    }
    const spacing = options.spacing;

    // Row and Column position in the Total Pixel Matrix
    if (!('point' in options) ) {
        throw new Error('Option "point" is required.');
    }
    if (!(Array.isArray(options.point))) {
        throw new Error('Option "point" must be an array.');
    }
    if (options.point.length !== 2) {
        throw new Error('Option "point" must be an array with 2 elements.');
    }
    const point = options.point;

    const m = [
      [orientation[0] * spacing[1], orientation[3] * spacing[0], offset[0]],
      [orientation[1] * spacing[1], orientation[4] * spacing[0], offset[1]],
      [0, 0, 1]
    ];

    const vImage = [
        [point[0]],
        [point[1]],
        [1]
    ];

    const vSlide = multiply(m, vImage);

    const x = Number(vSlide[0][0].toFixed(4));
    const y = Number(vSlide[1][0].toFixed(4));
    return [x, y];
}


/** Maps 3D (X, Y, Z) slide coordinate in to the Frame of Reference to
 * 2D (Column, Row) image coordinate in the Total Pixel Matrix.
 *
 * @param {Object} options - Options
 * @param {Array} options.offset - X and Y offset in the slide coordinate system
 * @param {Array} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {Array} options.spacing - Spacing between pixels along the Column and Row direction of the Total Pixel Matrix
 * @param {Array} options.piont - X, Y and Z position of the point in the slide coordinate system
 * @returns {Array} Column and Row position of the point in the Total Pixel Matrix
 * @memberof utils
 */
function mapSlideCoordToPixelCoord(options) {
    // X and Y Offset in Slide Coordinate System
    if (!('offset' in options) ) {
        throw new Error('Option "offset" is required.');
    }
    if (!(Array.isArray(options.offset))) {
        throw new Error('Option "offset" must be an array.');
    }
    if (options.offset.length !== 2) {
        throw new Error('Option "offset" must be an array with 2 elements.');
    }
    const offset = options.offset;

    // Image Orientation Slide with direction cosines for Row and Column direction
    if (!('orientation' in options) ) {
        throw new Error('Option "orientation" is required.');
    }
    if (!(Array.isArray(options.orientation))) {
        throw new Error('Option "orientation" must be an array.');
    }
    if (options.orientation.length !== 6) {
        throw new Error('Option "orientation" must be an array with 6 elements.');
    }
    const orientation = options.orientation;

    // Pixel Spacing along the Row and Column direction
    if (!('spacing' in options) ) {
        throw new Error('Option "spacing" is required.');
    }
    if (!(Array.isArray(options.spacing))) {
        throw new Error('Option "spacing" must be an array.');
    }
    if (options.spacing.length !== 2) {
        throw new Error('Option "spacing" must be an array with 2 elements.');
    }
    const spacing = options.spacing;

    // X and Y coordinate in the Slide Coordinate System
    if (!('point' in options) ) {
        throw new Error('Option "point" is required.');
    }
    if (!(Array.isArray(options.point))) {
        throw new Error('Option "point" must be an array.');
    }
    if (options.point.length !== 2) {
        throw new Error('Option "point" must be an array with 2 elements.');
    }
    const point = options.point;

    const m = [
      [orientation[0] * spacing[1], orientation[3] * spacing[0], offset[0]],
      [orientation[1] * spacing[1], orientation[4] * spacing[0], offset[1]],
      [0, 0, 1]
    ];
    const mInverted = inv(m);

    const vSlide = [
        [point[0]],
        [point[1]],
        [1]
    ];

    const vImage = multiply(mInverted, vSlide);

    const row = Number(vImage[1][0].toFixed(4));
    const col = Number(vImage[0][0].toFixed(4));
    return [col, row];
}

export { generateUID, mapPixelCoordToSlideCoord, mapSlideCoordToPixelCoord };

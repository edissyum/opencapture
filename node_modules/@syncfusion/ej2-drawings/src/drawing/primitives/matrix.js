/**
 * Matrix module is used to transform points based on offsets, angle
 */
/** @private */
export var MatrixTypes;
(function (MatrixTypes) {
    MatrixTypes[MatrixTypes["Identity"] = 0] = "Identity";
    MatrixTypes[MatrixTypes["Translation"] = 1] = "Translation";
    MatrixTypes[MatrixTypes["Scaling"] = 2] = "Scaling";
    MatrixTypes[MatrixTypes["Unknown"] = 4] = "Unknown";
})(MatrixTypes || (MatrixTypes = {}));
/** @private */
var Matrix = /** @class */ (function () {
    function Matrix(m11, m12, m21, m22, offsetX, offsetY, type) {
        this.m11 = m11;
        this.m12 = m12;
        this.m21 = m21;
        this.m22 = m22;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        // if (type === undefined) {
        //     this.type = MatrixTypes.Unknown;
        // } else {
        //     this.type = type;
        // }
        this.type = type;
    }
    return Matrix;
}());
export { Matrix };
/** @private */
export function identityMatrix() {
    return new Matrix(1, 0, 0, 1, 0, 0, MatrixTypes.Identity);
}
/** @private */
export function transformPointByMatrix(matrix, point) {
    var pt = multiplyPoint(matrix, point.x, point.y);
    return { x: Math.round(pt.x * 100) / 100, y: Math.round(pt.y * 100) / 100 };
}
/** @private */
export function transformPointsByMatrix(matrix, points) {
    var transformedPoints = [];
    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
        var point = points_1[_i];
        transformedPoints.push(transformPointByMatrix(matrix, point));
    }
    return transformedPoints;
}
/** @private */
export function rotateMatrix(matrix, angle, centerX, centerY) {
    angle %= 360.0;
    multiplyMatrix(matrix, createRotationRadians(angle * 0.017453292519943295, centerX ? centerX : 0, centerY ? centerY : 0));
}
/** @private */
export function scaleMatrix(matrix, scaleX, scaleY, centerX, centerY) {
    if (centerX === void 0) { centerX = 0; }
    if (centerY === void 0) { centerY = 0; }
    multiplyMatrix(matrix, createScaling(scaleX, scaleY, centerX, centerY));
}
/** @private */
export function translateMatrix(matrix, offsetX, offsetY) {
    if (matrix.type & MatrixTypes.Identity) {
        matrix.type = MatrixTypes.Translation;
        setMatrix(matrix, 1.0, 0.0, 0.0, 1.0, offsetX, offsetY);
        return;
    }
    if (matrix.type & MatrixTypes.Unknown) {
        matrix.offsetX += offsetX;
        matrix.offsetY += offsetY;
        return;
    }
    matrix.offsetX += offsetX;
    matrix.offsetY += offsetY;
    matrix.type |= MatrixTypes.Translation;
}
/** @private */
function createScaling(scaleX, scaleY, centerX, centerY) {
    var result = identityMatrix();
    result.type = !(centerX || centerY) ? MatrixTypes.Scaling : MatrixTypes.Scaling | MatrixTypes.Translation;
    setMatrix(result, scaleX, 0.0, 0.0, scaleY, centerX - scaleX * centerX, centerY - scaleY * centerY);
    return result;
}
/** @private */
function createRotationRadians(angle, centerX, centerY) {
    var result = identityMatrix();
    var num = Math.sin(angle);
    var num2 = Math.cos(angle);
    var offsetX = centerX * (1.0 - num2) + centerY * num;
    var offsetY = centerY * (1.0 - num2) - centerX * num;
    result.type = MatrixTypes.Unknown;
    setMatrix(result, num2, num, -num, num2, offsetX, offsetY);
    return result;
}
/** @private */
function multiplyPoint(matrix, x, y) {
    switch (matrix.type) {
        case MatrixTypes.Identity: break;
        case MatrixTypes.Translation:
            x += matrix.offsetX;
            y += matrix.offsetY;
            break;
        case MatrixTypes.Scaling:
            x *= matrix.m11;
            y *= matrix.m22;
            break;
        case MatrixTypes.Translation | MatrixTypes.Scaling:
            x *= matrix.m11;
            x += matrix.offsetX;
            y *= matrix.m22;
            y += matrix.offsetY;
            break;
        default:
            var num = y * matrix.m21 + matrix.offsetX;
            var num2 = x * matrix.m12 + matrix.offsetY;
            x *= matrix.m11;
            x += num;
            y *= matrix.m22;
            y += num2;
            break;
    }
    return { x: x, y: y };
}
/** @private */
export function multiplyMatrix(matrix1, matrix2) {
    var type = matrix1.type;
    var type2 = matrix2.type;
    if (type2 === MatrixTypes.Identity) {
        return;
    }
    if (type === MatrixTypes.Identity) {
        assignMatrix(matrix1, matrix2);
        matrix1.type = matrix2.type;
        return;
    }
    if (type2 === MatrixTypes.Translation) {
        matrix1.offsetX += matrix2.offsetX;
        matrix1.offsetY += matrix2.offsetY;
        if (type !== MatrixTypes.Unknown) {
            matrix1.type |= MatrixTypes.Translation;
        }
        return;
    }
    if (type !== MatrixTypes.Translation) {
        var num = type << 4 | type2;
        switch (num) {
            case 34:
                matrix1.m11 *= matrix2.m11;
                matrix1.m22 *= matrix2.m22;
                return;
            case 35:
                matrix1.m11 *= matrix2.m11;
                matrix1.m22 *= matrix2.m22;
                matrix1.offsetX = matrix2.offsetX;
                matrix1.offsetY = matrix2.offsetY;
                matrix1.type = (MatrixTypes.Translation | MatrixTypes.Scaling);
                return;
            case 36: break;
            default:
                {
                    switch (num) {
                        case 50:
                            matrix1.m11 *= matrix2.m11;
                            matrix1.m22 *= matrix2.m22;
                            matrix1.offsetX *= matrix2.m11;
                            matrix1.offsetY *= matrix2.m22;
                            return;
                        case 51:
                            matrix1.m11 *= matrix2.m11;
                            matrix1.m22 *= matrix2.m22;
                            matrix1.offsetX = matrix2.m11 * matrix1.offsetX + matrix2.offsetX;
                            matrix1.offsetY = matrix2.m22 * matrix1.offsetY + matrix2.offsetY;
                            return;
                        case 52: break;
                        default:
                            switch (num) {
                                case 66:
                                case 67:
                                case 68: break;
                                default: return;
                            }
                            break;
                    }
                    break;
                }
        }
        var result = identityMatrix();
        var m11New = matrix1.m11 * matrix2.m11 + matrix1.m12 * matrix2.m21;
        var m12New = matrix1.m11 * matrix2.m12 + matrix1.m12 * matrix2.m22;
        var m21New = matrix1.m21 * matrix2.m11 + matrix1.m22 * matrix2.m21;
        var m22New = matrix1.m21 * matrix2.m12 + matrix1.m22 * matrix2.m22;
        var offsetX_1 = matrix1.offsetX * matrix2.m11 + matrix1.offsetY * matrix2.m21 + matrix2.offsetX;
        var offsetY_1 = matrix1.offsetX * matrix2.m12 + matrix1.offsetY * matrix2.m22 + matrix2.offsetY;
        setMatrix(result, m11New, m12New, m21New, m22New, offsetX_1, offsetY_1);
        if (result.m21 || result.m12) {
            result.type = MatrixTypes.Unknown;
        }
        else {
            if (result.m11 && result.m11 !== 1.0 || result.m22 && result.m22 !== 1.0) {
                result.type = MatrixTypes.Scaling;
            }
            if (result.offsetX || result.offsetY) {
                result.type |= MatrixTypes.Translation;
            }
            if ((result.type & (MatrixTypes.Translation | MatrixTypes.Scaling)) === MatrixTypes.Identity) {
                result.type = MatrixTypes.Identity;
            }
            result.type = MatrixTypes.Scaling | MatrixTypes.Translation;
        }
        assignMatrix(matrix1, result);
        matrix1.type = result.type;
        return;
    }
    var offsetX = matrix1.offsetX;
    var offsetY = matrix1.offsetY;
    matrix1.offsetX = offsetX * matrix2.m11 + offsetY * matrix2.m21 + matrix2.offsetX;
    matrix1.offsetY = offsetX * matrix2.m12 + offsetY * matrix2.m22 + matrix2.offsetY;
    if (type2 === MatrixTypes.Unknown) {
        matrix1.type = MatrixTypes.Unknown;
        return;
    }
    matrix1.type = (MatrixTypes.Translation | MatrixTypes.Scaling);
}
/** @private */
function setMatrix(mat, m11, m12, m21, m22, x, y) {
    mat.m11 = m11;
    mat.m12 = m12;
    mat.m21 = m21;
    mat.m22 = m22;
    mat.offsetX = x;
    mat.offsetY = y;
}
/** @private */
function assignMatrix(matrix1, matrix2) {
    matrix1.m11 = matrix2.m11;
    matrix1.m12 = matrix2.m12;
    matrix1.m21 = matrix2.m21;
    matrix1.m22 = matrix2.m22;
    matrix1.offsetX = matrix2.offsetX;
    matrix1.offsetY = matrix2.offsetY;
    matrix1.type = matrix2.type;
}

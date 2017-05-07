'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      CallExpression: function CallExpression(path, options) {
        var loggers = options.opts.loggers || [{ pattern: 'console' }];
        if (isLogger(path, loggers)) {
          var description = [];
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = path.node.arguments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var expression = _step.value;

              if (description.length === 0) {
                var relativePath = void 0;
                var filePath = this.file.log.filename;
                if (filePath.charAt(0) !== '/') {
                  relativePath = filePath;
                } else {
                  var cwd = process.cwd();
                  relativePath = filePath.substring(cwd.length + 1);
                }

                if (!expression.loc) {
                  description.push(this.file.code.substring(expression.start, expression.end));
                } else {
                  var line = expression.loc.start.line;
                  var column = expression.loc.start.column;
                  description.push(relativePath + ':' + line + ':' + column + ':' + this.file.code.substring(expression.start, expression.end));
                }
              } else {
                description.push(this.file.code.substring(expression.start, expression.end));
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          path.node.arguments.unshift(t.stringLiteral(description.join(',')));
        }
      }
    }
  };
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isLogger(path, loggers) {
  return _lodash2.default.some(loggers, function (logger) {
    return path.get("callee").matchesPattern(logger.pattern, true);
  });
}
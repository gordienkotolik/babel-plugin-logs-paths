import _ from 'lodash';


var fs = require('fs');
var path = require('path');
var util = require('util');
var logsDir = path.resolve(process.cwd(), 'logs');
var cache;
var stringifier = function(cache) {
  return function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  };
};

JSON.stringifyOnce = function(obj, replacer, indent){
  var printedObjects = [];
  var printedObjectKeys = [];

  function printOnceReplacer(key, value){
    if ( printedObjects.length > 2000){ // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
      return 'object too long';
    }
    var printedObjIndex = false;
    printedObjects.forEach(function(obj, index){
      if(obj===value){
        printedObjIndex = index;
      }
    });

    if ( key == ''){ //root element
      printedObjects.push(obj);
      printedObjectKeys.push("root");
      return value;
    }

    else if(printedObjIndex+"" != "false" && typeof(value)=="object"){
      if ( printedObjectKeys[printedObjIndex] == "root"){
        return "(pointer to root)";
      }else{
        return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase()  : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
      }
    } else{

      var qualifiedKey = key || "(empty key)";
      printedObjects.push(value);
      printedObjectKeys.push(qualifiedKey);
      if(replacer){
        return replacer(key, value);
      }else{
        return value;
      }
    }
  }
  return JSON.stringify(obj, printOnceReplacer, indent);
};
// var printed = false;

var getParentPath = function (path, node) {
  if(!node) return path;
  let parent = node.getFunctionParent();
  if(!parent) return path;
  if(parent.type === 'FunctionDeclaration') {
    path = parent.id.name + ':' + path;
    return getParentPath(path, parent);
  }
  if(parent.type === 'MethodDefinition') {
    path = parent.key.name + ':' + path;
    return getParentPath(path, parent);
  }
  if(parent.type === 'ClassDeclaration') {
    path = parent.id.name + ':' + path;
    return getParentPath(path, parent);
  }
  if(parent.type === 'VariableDeclarator' && parent.init.type === 'FunctionExpression') {
    path = parent.id.name + ':' + path;
    return getParentPath(path, parent);
  }
  return getParentPath(path, parent);
};



function isLogger(path, loggers) {
  return _.some(loggers, function(logger) {
    return path.get("callee").matchesPattern(logger.pattern, true)
  })
}


export default function({types: t}) {
  return {
    visitor: {
      CallExpression(path, options) {
        const loggers = options.opts.loggers || [{pattern: 'console'}];
        if(isLogger(path, loggers)) {
          const description = [];
          for(let expression of path.node.arguments) {
            if(description.length === 0) {
              let relativePath;
              let filePath = this.file.log.filename;
              if(filePath.charAt(0) !== '/') {
                relativePath = filePath
              } else {
                let cwd = process.cwd();
                relativePath = filePath.substring(cwd.length + 1)
              }

              if(expression.loc) {
                let line = expression.loc.start.line;
                let column = expression.loc.start.column;
                description.push(
                  `${relativePath}:${line}:${column}:${this.file.code.substring(expression.start, expression.end)}`
                )
              }
            } else {
              description.push(this.file.code.substring(expression.start, expression.end))
            }

          }
          path.node.arguments.unshift(t.stringLiteral(description.join(',')))
        }
      }
    }
  }
}

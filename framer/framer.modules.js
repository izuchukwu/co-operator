require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"grid":[function(require,module,exports){
var Beep, operator,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

operator = require('operator');

exports.Grid = (function(superClass) {
  extend(Grid, superClass);

  function Grid(options) {
    var beep, column, i, j, ref, row;
    Grid.__super__.constructor.call(this, options);
    this.beepSize = options.beepSize;
    this.width = this.beepSize * 7;
    this.height = this.beepSize * 7;
    this.backgroundColor = "rgba(0,0,0,0)";
    this.showsDivider = (ref = options.showsDivider) != null ? ref : false;
    this.divider = new Layer({
      name: "Divider",
      backgroundColor: "rgba(0,0,0,0.1)",
      width: this.beepSize / 6,
      height: this.beepSize / 6,
      borderRadius: this.beepSize / 6,
      visible: this.showsDivider
    });
    this.addSubLayer(this.divider);
    this.beeps = [];
    for (row = i = 0; i <= 3; row = ++i) {
      this.beeps[row] = [];
      for (column = j = 0; j <= 3; column = ++j) {
        beep = new Beep({
          name: "Beep (" + (row + 1) + ", " + (column + 1) + ")",
          size: this.beepSize,
          x: column * (this.beepSize * 2),
          y: row * (this.beepSize * 2)
        });
        this.beeps[row].push(beep);
        this.addSubLayer(beep);
      }
    }
  }

  Grid.prototype.iterate = function(callback) {
    var column, i, results, row;
    results = [];
    for (row = i = 0; i <= 3; row = ++i) {
      results.push((function() {
        var j, results1;
        results1 = [];
        for (column = j = 0; j <= 3; column = ++j) {
          results1.push(callback(this.beeps[row][column], row, column));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  Grid.prototype.setPattern = function(pattern) {
    return this.iterate(function(beep, row, column) {
      return beep.active = pattern[row][column];
    });
  };

  Grid.prototype.setDivider = function(position) {
    this.divider.x = ((this.beepSize * 2) * position.x) - (this.beepSize / 2) - (this.beepSize / 6 / 2);
    return this.divider.y = ((this.beepSize * 2) * position.y) - (this.beepSize / 2) - (this.beepSize / 6 / 2);
  };

  return Grid;

})(Layer);

Beep = (function(superClass) {
  extend(Beep, superClass);

  function Beep(options) {
    Beep.__super__.constructor.call(this, options);
    this.width = options.size;
    this.height = options.size;
    this.borderRadius = options.size / 2;
    this.active = false;
  }

  Beep.property('active', {
    get: function() {
      return this._active;
    },
    set: function(_active) {
      this._active = _active;
      if (this.active) {
        return this.backgroundColor = "#fff";
      } else {
        return this.backgroundColor = "rgba(0,0,0,0.1)";
      }
    }
  });

  return Beep;

})(Layer);


},{"operator":"operator"}],"operator":[function(require,module,exports){
Function.prototype.property = function(property, methods) {
  return Object.defineProperty(this.prototype, property, methods);
};


},{}],"pattern":[function(require,module,exports){
var operator;

operator = require('operator');

exports.Pattern = (function() {
  function Pattern(divider) {
    var i, row;
    this.divider = divider;
    for (row = i = 0; i <= 3; row = ++i) {
      this[row] = [false, false, false, false];
    }
  }

  Pattern.prototype.iterate = function(callback) {
    var column, i, results, row;
    results = [];
    for (row = i = 0; i <= 3; row = ++i) {
      results.push((function() {
        var j, results1;
        results1 = [];
        for (column = j = 0; j <= 3; column = ++j) {
          results1.push(callback(this, row, column));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  Pattern.prototype.frameForQuadrant = function(sector) {
    var origin, size;
    origin = {
      x: sector === 1 || sector === 3 ? this.divider.x : 0,
      y: sector === 2 || sector === 3 ? this.divider.y : 0
    };
    size = {
      width: sector === 0 || sector === 2 ? this.divider.x : 4 - this.divider.x,
      height: sector === 0 || sector === 1 ? this.divider.y : 4 - this.divider.y
    };
    return {
      origin: origin,
      size: size
    };
  };

  Pattern.prototype.quadrant = function(sector) {
    var frame;
    frame = this.frameForQuadrant(sector);
    return new exports.Quadrant(this, frame.origin, frame.size);
  };

  Pattern.prototype.applyQuadrant = function(quadrant, sector) {
    var expectedFrame, pattern;
    expectedFrame = this.frameForQuadrant(sector);
    if (!quadrant.matchesOrigin(expectedFrame)) {
      return false;
    }
    if (!quadrant.matchesSize(expectedFrame)) {
      return false;
    }
    pattern = this;
    quadrant.iterate(function(quadrant, row, column, absoluteRow, absoluteColumn) {
      return pattern[absoluteRow][absoluteColumn] = quadrant[row][column];
    });
    return true;
  };

  Pattern.property('isBlank', {
    get: function() {
      var blank;
      blank = true;
      this.iterate(function(pattern, row, column) {
        if (pattern[row][column]) {
          return blank = false;
        }
      });
      return blank;
    }
  });

  return Pattern;

})();

exports.Quadrant = (function() {
  function Quadrant(pattern1, origin1, size1) {
    var column, i, j, ref, ref1, row;
    this.pattern = pattern1;
    this.origin = origin1;
    this.size = size1;
    if (this.isVoid) {
      return;
    }
    for (row = i = 0, ref = this.size.height - 1; 0 <= ref ? i <= ref : i >= ref; row = 0 <= ref ? ++i : --i) {
      this[row] = [];
      for (column = j = 0, ref1 = this.size.width - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; column = 0 <= ref1 ? ++j : --j) {
        this[row].push(this.pattern[this.origin.y + row][this.origin.x + column]);
      }
    }
  }

  Quadrant.prototype.iterate = function(callback) {
    var absoluteColumn, absoluteRow, column, i, ref, results, row;
    if (this.isVoid) {
      return;
    }
    results = [];
    for (row = i = 0, ref = this.size.height - 1; 0 <= ref ? i <= ref : i >= ref; row = 0 <= ref ? ++i : --i) {
      absoluteRow = this.origin.y + row;
      results.push((function() {
        var j, ref1, results1;
        results1 = [];
        for (column = j = 0, ref1 = this.size.width - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; column = 0 <= ref1 ? ++j : --j) {
          absoluteColumn = this.origin.x + column;
          results1.push(callback(this, row, column, absoluteRow, absoluteColumn));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  Quadrant.prototype.matchesOrigin = function(quadrant) {
    if (quadrant.origin.x !== this.origin.x) {
      return false;
    }
    if (quadrant.origin.y !== this.origin.y) {
      return false;
    }
    return true;
  };

  Quadrant.prototype.matchesSize = function(quadrant) {
    if (quadrant.size.width !== this.size.width) {
      return false;
    }
    if (quadrant.size.height !== this.size.height) {
      return false;
    }
    return true;
  };

  Quadrant.prototype.copy = function(original) {
    if (!this.matchesSize(original)) {
      throw "Quadrant mismatch";
    }
    return this.iterate(function(quadrant, row, column) {
      return quadrant[row][column] = original[row][column];
    });
  };

  Quadrant.MirrorUpDown = "up-down";

  Quadrant.MirrorLeftRight = "left-right";

  Quadrant.prototype.mirror = function(type) {
    return this.iterate(function(quadrant, row, column) {
      if (type === Quadrant.MirrorUpDown) {
        quadrant[row][column] = quadrant[(quadrant.size.height - 1) - row][column];
      }
      if (type === Quadrant.MirrorLeftRight) {
        return quadrant[row][column] = quadrant[row][(quadrant.size.width - 1) - column];
      }
    });
  };

  Quadrant.property('isVoid', {
    get: function() {
      return this.size.width === 0 || this.size.height === 0;
    }
  });

  return Quadrant;

})();


},{"operator":"operator"}],"type1":[function(require,module,exports){
var Pattern, Quadrant, operator, ref,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ref = require('pattern'), Pattern = ref.Pattern, Quadrant = ref.Quadrant;

operator = require('operator');

exports.Type1 = (function() {
  Type1.Duplicate = "duplicate";

  Type1.Mirror = "mirror";

  function Type1(options) {
    var operations, ref1, ref2, ref3, ref4, ref5, ref6, symmetricAxis;
    this.options = options;
    if (this.options != null) {
      ref1 = this.options, this.divider = ref1.divider, this.operation = ref1.operation;
    }
    if (!((ref2 = ((ref3 = this.divider) != null ? ref3.x : void 0) != null, indexOf.call([1, 2, 3, 4], ref2) >= 0) && (ref4 = ((ref5 = this.divider) != null ? ref5.y : void 0) != null, indexOf.call([1, 2, 3, 4], ref4) >= 0))) {
      this.divider = {
        x: Math.floor(Utils.randomNumber(1, 4.99)),
        y: Math.floor(Utils.randomNumber(1, 4.99))
      };
      if (this.divider.x !== 2 && this.divider.y !== 2) {
        symmetricAxis = Utils.randomChoice(["x", "y"]);
        this.divider[symmetricAxis] = 2;
      }
    }
    operations = [Type1.Duplicate, Type1.Mirror];
    if (!((this.operation != null) && (ref6 = this.operation, indexOf.call(operations, ref6) >= 0))) {
      this.operation = Utils.randomChoice(operations);
    }
  }

  Type1.prototype.generate = function() {
    var applied, complimentary1, complimentary1MasterSector, complimentary1Sector, complimentary2, complimentary2MasterSector, complimentary2Sector, master1, master1Sector, master2, master2Sector, pattern, type;
    pattern = new Pattern(this.divider);
    master1Sector = 0;
    master1 = pattern.quadrant(master1Sector);
    master1 = this.randomizeQuadrant(master1);
    applied = pattern.applyQuadrant(master1, master1Sector);
    if (!applied) {
      throw "Quadrant mismatch";
    }
    master2Sector = this.symmetricAxis === "x" ? 2 : 1;
    master2 = pattern.quadrant(master2Sector);
    master2 = this.randomizeQuadrant(master2);
    applied = pattern.applyQuadrant(master2, master2Sector);
    if (!applied) {
      throw "Quadrant mismatch";
    }
    complimentary1MasterSector = master1Sector;
    complimentary1Sector = this.symmetricAxis === "x" ? 1 : 2;
    complimentary1 = pattern.quadrant(complimentary1Sector);
    complimentary1.copy(master1);
    if (this.operation === Type1.Duplicate) {
      pattern.applyQuadrant(complimentary1, complimentary1Sector);
    } else if (this.operation === Type1.Mirror) {
      type = complimentary1Sector === 1 ? Quadrant.MirrorLeftRight : Quadrant.MirrorUpDown;
      complimentary1.mirror(type);
      applied = pattern.applyQuadrant(complimentary1, complimentary1Sector);
      if (!applied) {
        throw "Quadrant mismatch";
      }
    }
    complimentary2MasterSector = master2Sector;
    complimentary2Sector = 3;
    complimentary2 = pattern.quadrant(complimentary2Sector);
    complimentary2.copy(master2);
    if (this.operation === Type1.Duplicate) {
      pattern.applyQuadrant(complimentary2, complimentary2Sector);
    } else if (this.operation === Type1.Mirror) {
      type = complimentary2MasterSector === 1 ? Quadrant.MirrorUpDown : Quadrant.MirrorLeftRight;
      complimentary2.mirror(type);
      applied = pattern.applyQuadrant(complimentary2, complimentary2Sector);
      if (!applied) {
        throw "Quadrant mismatch";
      }
    }
    if (pattern.isBlank) {
      return this.generate();
    } else {
      return {
        pattern: pattern,
        divider: this.divider
      };
    }
  };

  Type1.prototype.randomizeQuadrant = function(quadrant) {
    quadrant.iterate(function(quadrant, row, column) {
      return quadrant[row][column] = Utils.randomChoice([true, false]);
    });
    return quadrant;
  };

  Type1.property('symmetricAxis', {
    get: function() {
      if (this.divider.x === 2) {
        return "x";
      } else {
        return "y";
      }
    }
  });

  return Type1;

})();


},{"operator":"operator","pattern":"pattern"}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvdHlwZTEuY29mZmVlIiwiLi4vbW9kdWxlcy9wYXR0ZXJuLmNvZmZlZSIsIi4uL21vZHVsZXMvb3BlcmF0b3IuY29mZmVlIiwiLi4vbW9kdWxlcy9ncmlkLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIyB0eXBlIDFcbiMjIGEgcXVhZHJhbnQtYmFzZWQsIHNlbWktc3ltbWV0cmljIHBhcmFtZXRyaWMgZ2VuZXJhdG9yXG4jIyBhY2NlcHRzIGEgZGl2aWRlciBsb2NhdGlvbiB0byBkaXZpZGUgdGhlIHBhdHRlcm4gaW50byBxdWFkcmFudHNcbiMjIGFuZCBhbiBvcGVyYXRpb24gdG8gcGVyZm9ybSBvbiBjb21wbGltZW50YXJ5IHF1YWRyYW50c1xuIyMgRHVwbGljYXRlIGR1cGxpY2F0ZXMgbWFzdGVyIHF1YWRyYW50cyBvbnRvIHRoZWlyIGNvbXBsaW1lbnRhcmllc1xuIyMgTWlycm9yIG1pcnJvcnMgbWFzdGVyIHF1YWRyYW50cyBvbnRvIHRoZWlyIGNvbXBsaW1lbnRhcmllc1xuXG57UGF0dGVybiwgUXVhZHJhbnR9ID0gcmVxdWlyZSAncGF0dGVybidcbm9wZXJhdG9yID0gcmVxdWlyZSAnb3BlcmF0b3InXG5cbmNsYXNzIGV4cG9ydHMuVHlwZTFcblx0QER1cGxpY2F0ZSA9IFwiZHVwbGljYXRlXCJcblx0QE1pcnJvciA9IFwibWlycm9yXCJcblxuXHRjb25zdHJ1Y3RvcjogKEBvcHRpb25zKSAtPlxuXHRcdGlmIEBvcHRpb25zPyB0aGVuIHtAZGl2aWRlciwgQG9wZXJhdGlvbn0gPSBAb3B0aW9uc1xuXG5cdFx0aWYgbm90IChAZGl2aWRlcj8ueD8gaW4gWzEuLjRdIGFuZCBAZGl2aWRlcj8ueT8gaW4gWzEuLjRdKVxuXHRcdFx0QGRpdmlkZXIgPVxuXHRcdFx0XHR4OiBNYXRoLmZsb29yIFV0aWxzLnJhbmRvbU51bWJlciAxLCA0Ljk5XG5cdFx0XHRcdHk6IE1hdGguZmxvb3IgVXRpbHMucmFuZG9tTnVtYmVyIDEsIDQuOTlcblx0XHRcdGlmIEBkaXZpZGVyLnggaXNudCAyIGFuZCBAZGl2aWRlci55IGlzbnQgMlxuXHRcdFx0XHRzeW1tZXRyaWNBeGlzID0gVXRpbHMucmFuZG9tQ2hvaWNlIFtcInhcIiwgXCJ5XCJdXG5cdFx0XHRcdEBkaXZpZGVyW3N5bW1ldHJpY0F4aXNdID0gMlxuXG5cdFx0b3BlcmF0aW9ucyA9IFtUeXBlMS5EdXBsaWNhdGUsIFR5cGUxLk1pcnJvcl1cblx0XHRpZiBub3QgKEBvcGVyYXRpb24/IGFuZCBAb3BlcmF0aW9uIGluIG9wZXJhdGlvbnMpXG5cdFx0XHRAb3BlcmF0aW9uID0gVXRpbHMucmFuZG9tQ2hvaWNlIG9wZXJhdGlvbnNcblxuXHRnZW5lcmF0ZTogLT5cblx0XHRwYXR0ZXJuID0gbmV3IFBhdHRlcm4gQGRpdmlkZXJcblxuXHRcdCMgbWFzdGVyIHF1YWRyYW50IDEgaXMgYWx3YXlzIHF1YWRyYW50IDAgKHRvcC1sZWZ0KVxuXHRcdG1hc3RlcjFTZWN0b3IgPSAwXG5cdFx0bWFzdGVyMSA9IHBhdHRlcm4ucXVhZHJhbnQgbWFzdGVyMVNlY3RvclxuXHRcdG1hc3RlcjEgPSBAcmFuZG9taXplUXVhZHJhbnQgbWFzdGVyMVxuXHRcdGFwcGxpZWQgPSBwYXR0ZXJuLmFwcGx5UXVhZHJhbnQgbWFzdGVyMSwgbWFzdGVyMVNlY3RvclxuXHRcdGlmICFhcHBsaWVkIHRoZW4gdGhyb3cgXCJRdWFkcmFudCBtaXNtYXRjaFwiXG5cblx0XHQjIG1hc3RlciBxdWFkcmFudCAyIGlzIHF1YWRyYW50IDEgKHRvcC1yaWdodCkgb3IgMiAoYm90dG9tLWxlZnQpXG5cdFx0IyBkZXBlbmRpbmcgb24gdGhlIHN5bW1ldHJpYyBheGlzICh4IG9yIHksIHJlc3BlY3RpdmVseSlcblx0XHRtYXN0ZXIyU2VjdG9yID0gaWYgQHN5bW1ldHJpY0F4aXMgaXMgXCJ4XCIgdGhlbiAyIGVsc2UgMVxuXHRcdG1hc3RlcjIgPSBwYXR0ZXJuLnF1YWRyYW50IG1hc3RlcjJTZWN0b3Jcblx0XHRtYXN0ZXIyID0gQHJhbmRvbWl6ZVF1YWRyYW50IG1hc3RlcjJcblx0XHRhcHBsaWVkID0gcGF0dGVybi5hcHBseVF1YWRyYW50IG1hc3RlcjIsIG1hc3RlcjJTZWN0b3Jcblx0XHRpZiAhYXBwbGllZCB0aGVuIHRocm93IFwiUXVhZHJhbnQgbWlzbWF0Y2hcIlxuXG5cdFx0IyBjb21wbGltZW50YXJ5IHF1YWRyYW50IDEgaXMgcXVhZHJhbnQgMSAodG9wLXJpZ2h0KSBvciAyIChib3R0b20tbGVmdClcblx0XHQjIGRlcGVuZGluZyBvbiB0aGUgc3ltbWV0cmljIGF4aXMgKHkgb3IgeCwgcmVzcGVjdGl2ZWx5KVxuXHRcdCMgaXRzIG1hc3RlciBxdWFkcmFudCBpcyBtYXN0ZXIgcXVhZHJhbnQgMSxcblx0XHQjIHNvIGl0cyBtYXN0ZXIgaXMgYWx3YXlzIHNlY3RvciAwXG5cdFx0Y29tcGxpbWVudGFyeTFNYXN0ZXJTZWN0b3IgPSBtYXN0ZXIxU2VjdG9yXG5cdFx0Y29tcGxpbWVudGFyeTFTZWN0b3IgPSBpZiBAc3ltbWV0cmljQXhpcyBpcyBcInhcIiB0aGVuIDEgZWxzZSAyXG5cdFx0I2NvbXBsaW1lbnRhcnkxID0gbWFzdGVyMVxuXHRcdGNvbXBsaW1lbnRhcnkxID0gcGF0dGVybi5xdWFkcmFudCBjb21wbGltZW50YXJ5MVNlY3RvclxuXHRcdGNvbXBsaW1lbnRhcnkxLmNvcHkgbWFzdGVyMVxuXHRcdGlmIEBvcGVyYXRpb24gaXMgVHlwZTEuRHVwbGljYXRlXG5cdFx0XHRwYXR0ZXJuLmFwcGx5UXVhZHJhbnQgY29tcGxpbWVudGFyeTEsIGNvbXBsaW1lbnRhcnkxU2VjdG9yXG5cdFx0ZWxzZSBpZiBAb3BlcmF0aW9uIGlzIFR5cGUxLk1pcnJvclxuXHRcdFx0IyBmb3IgQ1ExLCBpZiBzZWN0b3IgaXMgMSwgaXQncyBhIGxlZnQtcmlnaHQgbWlycm9yXG5cdFx0XHQjIGZvciBDUTEsIGlmIHNlY3RvciBpcyAyLCBpdCdzIGFuIHVwLWRvd24gbWlycm9yXG5cdFx0XHR0eXBlID1cblx0XHRcdFx0aWYgY29tcGxpbWVudGFyeTFTZWN0b3IgaXMgMSB0aGVuIFF1YWRyYW50Lk1pcnJvckxlZnRSaWdodFxuXHRcdFx0XHRlbHNlIFF1YWRyYW50Lk1pcnJvclVwRG93blxuXHRcdFx0Y29tcGxpbWVudGFyeTEubWlycm9yIHR5cGVcblx0XHRcdGFwcGxpZWQgPSBwYXR0ZXJuLmFwcGx5UXVhZHJhbnQgY29tcGxpbWVudGFyeTEsIGNvbXBsaW1lbnRhcnkxU2VjdG9yXG5cdFx0XHRpZiAhYXBwbGllZCB0aGVuIHRocm93IFwiUXVhZHJhbnQgbWlzbWF0Y2hcIlxuXG5cdFx0IyBjb21wbGltZW50YXJ5IHF1YWRyYW50IDIgaXMgYWx3YXlzIHF1YWRyYW50IDMgKGJvdHRvbS1yaWdodClcblx0XHQjIGl0cyBtYXN0ZXIgcXVhZHJhbnQgaXMgbWFzdGVyIHF1YWRyYW50IDIsXG5cdFx0IyBzbyBpdHMgbWFzdGVyIHNlY3RvciBpcyAxIG9yIDIsIGRlcGVuZGluZyBvbiB0aGUgc3ltbWV0cmljIGF4aXNcblx0XHRjb21wbGltZW50YXJ5Mk1hc3RlclNlY3RvciA9IG1hc3RlcjJTZWN0b3Jcblx0XHRjb21wbGltZW50YXJ5MlNlY3RvciA9IDNcblx0XHQjY29tcGxpbWVudGFyeTIgPSBtYXN0ZXIyXG5cdFx0Y29tcGxpbWVudGFyeTIgPSBwYXR0ZXJuLnF1YWRyYW50IGNvbXBsaW1lbnRhcnkyU2VjdG9yXG5cdFx0Y29tcGxpbWVudGFyeTIuY29weSBtYXN0ZXIyXG5cdFx0aWYgQG9wZXJhdGlvbiBpcyBUeXBlMS5EdXBsaWNhdGVcblx0XHRcdHBhdHRlcm4uYXBwbHlRdWFkcmFudCBjb21wbGltZW50YXJ5MiwgY29tcGxpbWVudGFyeTJTZWN0b3Jcblx0XHRlbHNlIGlmIEBvcGVyYXRpb24gaXMgVHlwZTEuTWlycm9yXG5cdFx0XHQjIGZvciBDUTIsIGlmIG1hc3RlciBzZWN0b3IgaXMgMSwgaXQncyBhbiB1cC1kb3duIG1pcnJvclxuXHRcdFx0IyBmb3IgQ1EyLCBpZiBtYXN0ZXIgc2VjdG9yIGlzIDIsIGl0J3MgYSBsZWZ0LXJpZ2h0IG1pcnJvclxuXHRcdFx0dHlwZSA9XG5cdFx0XHRcdGlmIGNvbXBsaW1lbnRhcnkyTWFzdGVyU2VjdG9yIGlzIDEgdGhlbiBRdWFkcmFudC5NaXJyb3JVcERvd25cblx0XHRcdFx0ZWxzZSBRdWFkcmFudC5NaXJyb3JMZWZ0UmlnaHRcblx0XHRcdGNvbXBsaW1lbnRhcnkyLm1pcnJvciB0eXBlXG5cdFx0XHRhcHBsaWVkID0gcGF0dGVybi5hcHBseVF1YWRyYW50IGNvbXBsaW1lbnRhcnkyLCBjb21wbGltZW50YXJ5MlNlY3RvclxuXHRcdFx0aWYgIWFwcGxpZWQgdGhlbiB0aHJvdyBcIlF1YWRyYW50IG1pc21hdGNoXCJcblxuXHRcdGlmIHBhdHRlcm4uaXNCbGFua1xuXHRcdFx0cmV0dXJuIEBnZW5lcmF0ZSgpXG5cdFx0ZWxzZSByZXR1cm4ge3BhdHRlcm46IHBhdHRlcm4sIGRpdmlkZXI6IEBkaXZpZGVyfVxuXG5cdHJhbmRvbWl6ZVF1YWRyYW50OiAocXVhZHJhbnQpIC0+XG5cdFx0cXVhZHJhbnQuaXRlcmF0ZSAocXVhZHJhbnQsIHJvdywgY29sdW1uKSAtPlxuXHRcdFx0cXVhZHJhbnRbcm93XVtjb2x1bW5dID0gVXRpbHMucmFuZG9tQ2hvaWNlIFt0cnVlLCBmYWxzZV1cblx0XHRyZXR1cm4gcXVhZHJhbnRcblxuXHRAcHJvcGVydHkgJ3N5bW1ldHJpY0F4aXMnLFxuXHRcdGdldDogLT4gaWYgQGRpdmlkZXIueCBpcyAyIHRoZW4gXCJ4XCIgZWxzZSBcInlcIlxuIiwiIyBwYXR0ZXJuXG4jIyBhIDR4NCBzaW5nbGUgcG9ja2V0IG9wZXJhdG9yIHBhdHRlcm4gbWF0cml4XG4jIyB3aXRoIGNvbnZlbmllbnQgbWV0aG9kcyBmb3IgcXVhZHJhbnQgb3BlcmF0aW9uc1xuXG5vcGVyYXRvciA9IHJlcXVpcmUgJ29wZXJhdG9yJ1xuXG5jbGFzcyBleHBvcnRzLlBhdHRlcm5cblx0Y29uc3RydWN0b3I6IChAZGl2aWRlcikgLT5cblx0XHRmb3Igcm93IGluIFswLi4zXVxuXHRcdFx0QFtyb3ddID0gW2ZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXVxuXG5cdGl0ZXJhdGU6IChjYWxsYmFjaykgLT5cblx0XHRmb3Igcm93IGluIFswLi4zXVxuXHRcdFx0Zm9yIGNvbHVtbiBpbiBbMC4uM11cblx0XHRcdFx0Y2FsbGJhY2sgQCwgcm93LCBjb2x1bW5cblxuXHRmcmFtZUZvclF1YWRyYW50OiAoc2VjdG9yKSAtPlxuXHRcdG9yaWdpbiA9XG5cdFx0XHR4OiBpZiBzZWN0b3IgaW4gWzEsIDNdIHRoZW4gQGRpdmlkZXIueCBlbHNlIDBcblx0XHRcdHk6IGlmIHNlY3RvciBpbiBbMiwgM10gdGhlbiBAZGl2aWRlci55IGVsc2UgMFxuXHRcdHNpemUgPVxuXHRcdFx0d2lkdGg6IGlmIHNlY3RvciBpbiBbMCwgMl0gdGhlbiBAZGl2aWRlci54IGVsc2UgNCAtIEBkaXZpZGVyLnhcblx0XHRcdGhlaWdodDogaWYgc2VjdG9yIGluIFswLCAxXSB0aGVuIEBkaXZpZGVyLnkgZWxzZSA0IC0gQGRpdmlkZXIueVxuXHRcdHJldHVybiB7b3JpZ2luLCBzaXplfVxuXG5cdHF1YWRyYW50OiAoc2VjdG9yKSAtPlxuXHRcdGZyYW1lID0gQGZyYW1lRm9yUXVhZHJhbnQgc2VjdG9yXG5cdFx0cmV0dXJuIG5ldyBleHBvcnRzLlF1YWRyYW50IEAsIGZyYW1lLm9yaWdpbiwgZnJhbWUuc2l6ZVxuXG5cdGFwcGx5UXVhZHJhbnQ6IChxdWFkcmFudCwgc2VjdG9yKSAtPlxuXHRcdCMgdmVyaWZ5IGZyYW1lXG5cdFx0ZXhwZWN0ZWRGcmFtZSA9IEBmcmFtZUZvclF1YWRyYW50IHNlY3RvclxuXHRcdGlmIG5vdCBxdWFkcmFudC5tYXRjaGVzT3JpZ2luIGV4cGVjdGVkRnJhbWUgdGhlbiByZXR1cm4gZmFsc2Vcblx0XHRpZiBub3QgcXVhZHJhbnQubWF0Y2hlc1NpemUgZXhwZWN0ZWRGcmFtZSB0aGVuIHJldHVybiBmYWxzZVxuXG5cdFx0IyBhcHBseSBpdFxuXHRcdHBhdHRlcm4gPSBAXG5cdFx0cXVhZHJhbnQuaXRlcmF0ZSAocXVhZHJhbnQsIHJvdywgY29sdW1uLCBhYnNvbHV0ZVJvdywgYWJzb2x1dGVDb2x1bW4pIC0+XG5cdFx0XHRwYXR0ZXJuW2Fic29sdXRlUm93XVthYnNvbHV0ZUNvbHVtbl0gPSBxdWFkcmFudFtyb3ddW2NvbHVtbl1cblx0XHRyZXR1cm4gdHJ1ZVxuXG5cdEBwcm9wZXJ0eSAnaXNCbGFuaycsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0YmxhbmsgPSB0cnVlXG5cdFx0XHRAaXRlcmF0ZSAocGF0dGVybiwgcm93LCBjb2x1bW4pIC0+XG5cdFx0XHRcdGlmIHBhdHRlcm5bcm93XVtjb2x1bW5dIHRoZW4gYmxhbmsgPSBmYWxzZVxuXHRcdFx0cmV0dXJuIGJsYW5rXG5cbiMgcGF0dGVybiBxdWFkcmFudFxuIyMgYSBxdWFkcmFudCBvZiBhIHBhdHRlcm5cbiMjIHdpdGggY29udmVuaWVudCBtZXRob2RzIGZvciBkdXBsaWNhdGlvbiwgbWlycm9yaW5nLFxuIyMgYW5kIHF1YWRyYW50IGNvbXBhcmlzb25zXG5cbmNsYXNzIGV4cG9ydHMuUXVhZHJhbnRcblx0Y29uc3RydWN0b3I6IChAcGF0dGVybiwgQG9yaWdpbiwgQHNpemUpIC0+XG5cdFx0aWYgQGlzVm9pZCB0aGVuIHJldHVyblxuXHRcdGZvciByb3cgaW4gWzAuLkBzaXplLmhlaWdodCAtIDFdXG5cdFx0XHRAW3Jvd10gPSBbXVxuXHRcdFx0Zm9yIGNvbHVtbiBpbiBbMC4uQHNpemUud2lkdGggLSAxXVxuXHRcdFx0XHRAW3Jvd10ucHVzaCBAcGF0dGVybltAb3JpZ2luLnkgKyByb3ddW0BvcmlnaW4ueCArIGNvbHVtbl1cblxuXHRpdGVyYXRlOiAoY2FsbGJhY2spIC0+XG5cdFx0aWYgQGlzVm9pZCB0aGVuIHJldHVyblxuXHRcdGZvciByb3cgaW4gWzAuLkBzaXplLmhlaWdodCAtIDFdXG5cdFx0XHRhYnNvbHV0ZVJvdyA9IEBvcmlnaW4ueSArIHJvd1xuXHRcdFx0Zm9yIGNvbHVtbiBpbiBbMC4uQHNpemUud2lkdGggLSAxXVxuXHRcdFx0XHRhYnNvbHV0ZUNvbHVtbiA9IEBvcmlnaW4ueCArIGNvbHVtblxuXHRcdFx0XHRjYWxsYmFjayBALCByb3csIGNvbHVtbiwgYWJzb2x1dGVSb3csIGFic29sdXRlQ29sdW1uXG5cblx0bWF0Y2hlc09yaWdpbjogKHF1YWRyYW50KSAtPlxuXHRcdGlmIHF1YWRyYW50Lm9yaWdpbi54IGlzbnQgQG9yaWdpbi54IHRoZW4gcmV0dXJuIGZhbHNlXG5cdFx0aWYgcXVhZHJhbnQub3JpZ2luLnkgaXNudCBAb3JpZ2luLnkgdGhlbiByZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gdHJ1ZVxuXG5cdG1hdGNoZXNTaXplOiAocXVhZHJhbnQpIC0+XG5cdFx0aWYgcXVhZHJhbnQuc2l6ZS53aWR0aCBpc250IEBzaXplLndpZHRoIHRoZW4gcmV0dXJuIGZhbHNlXG5cdFx0aWYgcXVhZHJhbnQuc2l6ZS5oZWlnaHQgaXNudCBAc2l6ZS5oZWlnaHQgdGhlbiByZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gdHJ1ZVxuXG5cdGNvcHk6IChvcmlnaW5hbCkgLT5cblx0XHRpZiBub3QgQG1hdGNoZXNTaXplIG9yaWdpbmFsXG5cdFx0XHR0aHJvdyBcIlF1YWRyYW50IG1pc21hdGNoXCJcblx0XHRAaXRlcmF0ZSAocXVhZHJhbnQsIHJvdywgY29sdW1uKSAtPlxuXHRcdFx0cXVhZHJhbnRbcm93XVtjb2x1bW5dID0gb3JpZ2luYWxbcm93XVtjb2x1bW5dXG5cblx0QE1pcnJvclVwRG93biA9IFwidXAtZG93blwiXG5cdEBNaXJyb3JMZWZ0UmlnaHQgPSBcImxlZnQtcmlnaHRcIlxuXHRtaXJyb3I6ICh0eXBlKSAtPlxuXHRcdEBpdGVyYXRlIChxdWFkcmFudCwgcm93LCBjb2x1bW4pIC0+XG5cdFx0XHRpZiB0eXBlIGlzIFF1YWRyYW50Lk1pcnJvclVwRG93blxuXHRcdFx0XHRxdWFkcmFudFtyb3ddW2NvbHVtbl0gPSBxdWFkcmFudFsocXVhZHJhbnQuc2l6ZS5oZWlnaHQgLSAxKSAtIHJvd11bY29sdW1uXVxuXHRcdFx0aWYgdHlwZSBpcyBRdWFkcmFudC5NaXJyb3JMZWZ0UmlnaHRcblx0XHRcdFx0cXVhZHJhbnRbcm93XVtjb2x1bW5dID0gcXVhZHJhbnRbcm93XVsocXVhZHJhbnQuc2l6ZS53aWR0aCAtIDEpIC0gY29sdW1uXVxuXG5cdEBwcm9wZXJ0eSAnaXNWb2lkJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRyZXR1cm4gQHNpemUud2lkdGggaXMgMCBvciBAc2l6ZS5oZWlnaHQgaXMgMFxuIiwiIyBvcGVyYXRvclxuIyMgc2hhcmVkIHV0aWxzIGFtb25nc3QgY28tb3BlcmF0b3IgbW9kdWxlc1xuXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcGVydHksIG1ldGhvZHMpIC0+XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wZXJ0eSwgbWV0aG9kc1xuIiwiIyBncmlkXG4jIyBncmlkIGRpc3BsYXlzIHBhdHRlcm5zXG4jIyBhbG9uZyB3aXRoIGEgc21hbGwgZGl2aWRlciBpbmRpY2F0b3Jcblxub3BlcmF0b3IgPSByZXF1aXJlICdvcGVyYXRvcidcblxuY2xhc3MgZXhwb3J0cy5HcmlkIGV4dGVuZHMgTGF5ZXJcblx0Y29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuXHRcdHN1cGVyIG9wdGlvbnNcblx0XHRAYmVlcFNpemUgPSBvcHRpb25zLmJlZXBTaXplXG5cdFx0QHdpZHRoID0gQGJlZXBTaXplICogN1xuXHRcdEBoZWlnaHQgPSBAYmVlcFNpemUgKiA3XG5cdFx0QGJhY2tncm91bmRDb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiXG5cdFx0QHNob3dzRGl2aWRlciA9IG9wdGlvbnMuc2hvd3NEaXZpZGVyID8gZmFsc2VcblxuXHRcdEBkaXZpZGVyID0gbmV3IExheWVyXG5cdFx0XHRuYW1lOiBcIkRpdmlkZXJcIlxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInJnYmEoMCwwLDAsMC4xKVwiXG5cdFx0XHR3aWR0aDogQGJlZXBTaXplIC8gNlxuXHRcdFx0aGVpZ2h0OiBAYmVlcFNpemUgLyA2XG5cdFx0XHRib3JkZXJSYWRpdXM6IEBiZWVwU2l6ZSAvIDZcblx0XHRcdHZpc2libGU6IEBzaG93c0RpdmlkZXJcblx0XHRAYWRkU3ViTGF5ZXIgQGRpdmlkZXJcblxuXHRcdEBiZWVwcyA9IFtdXG5cblx0XHRmb3Igcm93IGluIFswLi4zXVxuXHRcdFx0QGJlZXBzW3Jvd10gPSBbXVxuXHRcdFx0Zm9yIGNvbHVtbiBpbiBbMC4uM11cblx0XHRcdFx0YmVlcCA9IG5ldyBCZWVwXG5cdFx0XHRcdFx0bmFtZTogXCJCZWVwICgje3JvdyArIDF9LCAje2NvbHVtbiArIDF9KVwiXG5cdFx0XHRcdFx0c2l6ZTogQGJlZXBTaXplXG5cdFx0XHRcdFx0eDogY29sdW1uICogKEBiZWVwU2l6ZSAqIDIpXG5cdFx0XHRcdFx0eTogcm93ICogKEBiZWVwU2l6ZSAqIDIpXG5cdFx0XHRcdEBiZWVwc1tyb3ddLnB1c2ggYmVlcFxuXHRcdFx0XHRAYWRkU3ViTGF5ZXIgYmVlcFxuXG5cdGl0ZXJhdGU6IChjYWxsYmFjaykgLT5cblx0XHRmb3Igcm93IGluIFswLi4zXVxuXHRcdFx0Zm9yIGNvbHVtbiBpbiBbMC4uM11cblx0XHRcdFx0Y2FsbGJhY2sgQGJlZXBzW3Jvd11bY29sdW1uXSwgcm93LCBjb2x1bW5cblxuXHRzZXRQYXR0ZXJuOiAocGF0dGVybikgLT5cblx0XHRAaXRlcmF0ZSAoYmVlcCwgcm93LCBjb2x1bW4pIC0+XG5cdFx0XHRiZWVwLmFjdGl2ZSA9IHBhdHRlcm5bcm93XVtjb2x1bW5dXG5cblx0c2V0RGl2aWRlcjogKHBvc2l0aW9uKSAtPlxuXHRcdEBkaXZpZGVyLnggPSAoKEBiZWVwU2l6ZSAqIDIpICogcG9zaXRpb24ueCkgLSAoQGJlZXBTaXplIC8gMikgLSAoQGJlZXBTaXplIC8gNiAvIDIpXG5cdFx0QGRpdmlkZXIueSA9ICgoQGJlZXBTaXplICogMikgKiBwb3NpdGlvbi55KSAtIChAYmVlcFNpemUgLyAyKSAtIChAYmVlcFNpemUgLyA2IC8gMilcblxuY2xhc3MgQmVlcCBleHRlbmRzIExheWVyXG5cdGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cblx0XHRzdXBlciBvcHRpb25zXG5cdFx0QHdpZHRoID0gb3B0aW9ucy5zaXplXG5cdFx0QGhlaWdodCA9IG9wdGlvbnMuc2l6ZVxuXHRcdEBib3JkZXJSYWRpdXMgPSBvcHRpb25zLnNpemUgLyAyXG5cdFx0QGFjdGl2ZSA9IGZhbHNlXG5cblx0QHByb3BlcnR5ICdhY3RpdmUnLFxuXHRcdGdldDogLT4gQF9hY3RpdmVcblx0XHRzZXQ6IChAX2FjdGl2ZSkgLT5cblx0XHRcdGlmIEBhY3RpdmUgdGhlbiBAYmFja2dyb3VuZENvbG9yID0gXCIjZmZmXCJcblx0XHRcdGVsc2UgQGJhY2tncm91bmRDb2xvciA9IFwicmdiYSgwLDAsMCwwLjEpXCJcbiIsIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBSUFBO0FESUEsSUFBQSxj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

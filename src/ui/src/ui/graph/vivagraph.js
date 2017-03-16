/* jscs:disable */
/* eslint-disable */
/**
 * VivaGraph (https://github.com/anvaka/VivaGraphJS)
 * @author Andrei Kashcha (aka anvaka) / http://anvaka.blogspot.com
 *
 * Patches:
 *   - use el.getBoundingClientRect() in Utils.getDimension() instead of el.clientWidth/el.clientHeight (https://bugzilla.mozilla.org/show_bug.cgi?id=874811)
 */
var Viva = {};
Viva.Graph = Viva.Graph || {};
Viva.Graph.version = "1.0.0.42";
Viva.lazyExtend = function(b, c) {
    var a;
    b || (b = {});
    if (c) {
        for (a in c) {
            if (c.hasOwnProperty(a)) {
                var d = b.hasOwnProperty(a), e = typeof c[a];
                d && typeof b[a] === e ? "object" === e && (b[a] = Viva.lazyExtend(b[a], c[a])) : b[a] = c[a]
            }
        }
    }
    return b
};
Viva.random = function() {
    function b() {
        var a = 4022871197, b = function(b) {
            var d;
            b = b.toString();
            for (d = 0; d < b.length; d++) {
                a += b.charCodeAt(d);
                var c = .02519603282416938 * a;
                a = c >>> 0;
                c -= a;
                c *= a;
                a = c >>> 0;
                c -= a;
                a += 4294967296 * c
            }
            return 2.3283064365386963E-10 * (a >>> 0)
        };
        b.version = "Mash 0.9";
        return b
    }

    var c = new function(a) {
        return function(a) {
            var c = 0, h = 58, f = 119, g = 178, l, m, k = [], n = b();
            0 === a.length && (a = [+new Date]);
            for (l = 0; 256 > l; l++) {
                k[l] = n(" "), k[l] -= 4.76837158203125E-7 * n(" "), 0 > k[l] && (k[l] += 1);
            }
            for (m = 0; m < a.length; m++) {
                for (l = 0; 256 >
                l; l++) {
                    k[l] -= n(a[m]), k[l] -= 4.76837158203125E-7 * n(a[m]), 0 > k[l] && (k[l] += 1);
                }
            }
            var n = null, p = function() {
                var a;
                c = c + 1 & 255;
                h = h + 1 & 255;
                f = f + 1 & 255;
                g = g + 1 & 255;
                a = k[c] - k[h];
                0 > a && (a += 1);
                a -= k[f];
                0 > a && (a += 1);
                a -= k[g];
                0 > a && (a += 1);
                return k[c] = a
            };
            p.uint32 = function() {
                return 4294967296 * p() >>> 0
            };
            p.fract53 = p;
            p.version = "LFIB4 0.9";
            p.args = a;
            return p
        }(a)
    }(Array.prototype.slice.call(arguments));
    return {
        next: function(a) {
            return Math.floor(c() * a)
        }, nextDouble: function() {
            return c()
        }
    }
};
Viva.randomIterator = function(b, c) {
    c = c || Viva.random();
    return {
        forEach: function(a) {
            var d, e, h;
            for (d = b.length - 1; 0 < d; --d) {
                e = c.next(d + 1), h = b[e], b[e] = b[d], b[d] = h, a(h);
            }
            b.length && a(b[0])
        }, shuffle: function() {
            var a, d, e;
            for (a = b.length - 1; 0 < a; --a) {
                d = c.next(a + 1), e = b[d], b[d] = b[a], b[a] = e;
            }
            return b
        }
    }
};
Viva.BrowserInfo = function() {
    if ("undefined" === typeof window || !window.hasOwnProperty("navigator")) {
        return {browser: "", version: "0"};
    }
    var b = window.navigator.userAgent.toLowerCase(), c = /(opera)(?:.*version)?[ \/]([\w.]+)/, a = /(msie) ([\w.]+)/, d = /(mozilla)(?:.*? rv:([\w.]+))?/, b = /(webkit)[ \/]([\w.]+)/.exec(b) || c.exec(b) || a.exec(b) || 0 > b.indexOf("compatible") && d.exec(b) || [];
    return {browser: b[1] || "", version: b[2] || "0"}
}();
Viva.Graph.Utils = Viva.Graph.Utils || {};
Viva.Graph.Utils.indexOfElementInArray = function(b, c) {
    if (c.indexOf) {
        return c.indexOf(b);
    }
    var a = c.length, d;
    for (d = 0; d < a; d += 1) {
        if (c.hasOwnProperty(d) && c[d] === b) {
            return d;
        }
    }
    return -1
};
Viva.Graph.Utils = Viva.Graph.Utils || {};
Viva.Graph.Utils.getDimension = function(b) {
    if (!b) {
        throw{message: "Cannot get dimensions of undefined container"};
    }
    return b.getBoundingClientRect()
};
Viva.Graph.Utils.findElementPosition = function(b) {
    var c = 0, a = 0;
    if (b.offsetParent) {
        do {
            c += b.offsetLeft, a += b.offsetTop;
        } while (null !== (b = b.offsetParent))
    }
    return [c, a]
};
Viva.Graph.Utils = Viva.Graph.Utils || {};
Viva.Graph.Utils.events = function(b) {
    var c = function(a) {
        var b = {};
        a.fire = function(a, c) {
            var f, g, l;
            if ("string" !== typeof a) {
                throw"Only strings can be used as even type";
            }
            if (b.hasOwnProperty(a)) {
                for (f = b[a], l = 0; l < f.length; ++l) {
                    g = f[l], g = g.method, g(c);
                }
            }
            return this
        };
        a.addEventListener = function(a, c) {
            if ("function" !== typeof c) {
                throw"Only functions allowed to be callbacks";
            }
            var f = {method: c};
            b.hasOwnProperty(a) ? b[a].push(f) : b[a] = [f];
            return this
        };
        a.removeEventListener = function(a, c) {
            if ("function" !== typeof c) {
                throw"Only functions allowed to be callbacks";
            }
            if (b.hasOwnProperty(a)) {
                var f = b[a], g;
                for (g = 0; g < f.length; ++g) {
                    if (f[g].callback === c) {
                        f.splice(g);
                        break
                    }
                }
            }
            return this
        };
        return a
    };
    return {
        on: function(a, d) {
            b.addEventListener ? b.addEventListener(a, d, !1) : b.attachEvent && b.attachEvent("on" + a, d);
            return this
        }, stop: function(a, d) {
            b.removeEventListener ? b.removeEventListener(a, d, !1) : b.detachEvent && b.detachEvent("on" + a, d)
        }, extend: function() {
            return c(b)
        }
    }
};
Viva.Graph.Utils = Viva.Graph.Utils || {};
Viva.Graph.Utils.dragndrop = function(b) {
    var c, a, d, e, h, f, g = Viva.Graph.Utils.events(window.document), l = Viva.Graph.Utils.events(b), m = Viva.Graph.Utils.findElementPosition, k = 0, n = 0, p, q = function(a) {
        a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0;
        return !1
    }, t = function(b) {
        b = b || window.event;
        a && a(b, {x: b.clientX - k, y: b.clientY - n});
        k = b.clientX;
        n = b.clientY
    }, v = function(a) {
        a = a || window.event;
        if (1 === a.button && null !== window.event || 0 === a.button) {
            return k = a.clientX, n = a.clientY, p = a.target || a.srcElement, c && c(a, {
                x: k,
                y: n
            }), g.on("mousemove", t), g.on("mouseup", w), a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0, h = window.document.onselectstart, f = window.document.ondragstart, window.document.onselectstart = q, p.ondragstart = q, !1
        }
    }, w = function(a) {
        g.stop("mousemove", t);
        g.stop("mouseup", w);
        window.document.onselectstart = h;
        p.ondragstart = f;
        p = null;
        d && d()
    }, x = function(a) {
        if ("function" === typeof e) {
            a = a || window.event;
            a.preventDefault && a.preventDefault();
            a.returnValue = !1;
            var d, c = 0, f = 0;
            d = a || window.event;
            if (d.pageX || d.pageY) {
                c = d.pageX,
                    f = d.pageY;
            } else if (d.clientX || d.clientY) {
                c = d.clientX + window.document.body.scrollLeft + window.document.documentElement.scrollLeft, f = d.clientY + window.document.body.scrollTop + window.document.documentElement.scrollTop;
            }
            d = [c, f];
            c = m(b);
            e(a, a.wheelDelta ? a.wheelDelta / 360 : a.detail / -9, {x: d[0] - c[0], y: d[1] - c[1]})
        }
    }, r = function(a) {
        !e && a ? "webkit" === Viva.BrowserInfo.browser ? b.addEventListener("mousewheel", x, !1) : b.addEventListener("DOMMouseScroll", x, !1) : e && !a && ("webkit" === Viva.BrowserInfo.browser ? b.removeEventListener("mousewheel",
                    x, !1) : b.removeEventListener("DOMMouseScroll", x, !1));
        e = a
    };
    l.on("mousedown", v);
    return {
        onStart: function(a) {
            c = a;
            return this
        }, onDrag: function(b) {
            a = b;
            return this
        }, onStop: function(a) {
            d = a;
            return this
        }, onScroll: function(a) {
            r(a);
            return this
        }, release: function() {
            g.stop("mousemove", t);
            g.stop("mousedown", v);
            g.stop("mouseup", w);
            r(null)
        }
    }
};
Viva.Input = Viva.Input || {};
Viva.Input.domInputManager = function(b, c) {
    return {
        bindDragNDrop: function(a, b) {
            if (b) {
                var c = Viva.Graph.Utils.dragndrop(a.ui);
                if ("function" === typeof b.onStart) {
                    c.onStart(b.onStart);
                }
                if ("function" === typeof b.onDrag) {
                    c.onDrag(b.onDrag);
                }
                if ("function" === typeof b.onStop) {
                    c.onStop(b.onStop);
                }
                a.events = c
            } else {
                a.events && (a.events.release(), a.events = null, delete a.events)
            }
        }
    }
};
Viva.Graph.spatialIndex = function(b, c) {
    var a, d = 16;
    "function" === typeof c ? a = function(a, d) {
            var f = null;
            b.forEachNode(function(b) {
                if (c(b, a, d)) {
                    return f = b, !0
                }
            });
            return f
        } : "number" === typeof c && (d = c, a = function(a, c) {
            var f = null;
            b.forEachNode(function(b) {
                var l = b.position;
                if (l.x - d < a && a < l.x + d && l.y - d < c && c < l.y + d) {
                    return f = b, !0
                }
            });
            return f
        });
    return {getNodeAt: a}
};
Viva.Graph.Utils = Viva.Graph.Utils || {};
(function() {
    var b = 0, c = ["ms", "moz", "webkit", "o"], a, d = d || window || {};
    for (a = 0; a < c.length && !d.requestAnimationFrame; ++a) {
        var e = c[a];
        d.requestAnimationFrame = d[e + "RequestAnimationFrame"];
        d.cancelAnimationFrame = d[e + "CancelAnimationFrame"] || d[e + "CancelRequestAnimationFrame"]
    }
    d.requestAnimationFrame || (d.requestAnimationFrame = function(a, c) {
        var e = (new Date).getTime(), l = Math.max(0, 16 - (e - b)), m = d.setTimeout(function() {
            a(e + l)
        }, l);
        b = e + l;
        return m
    });
    d.cancelAnimationFrame || (d.cancelAnimationFrame = function(a) {
        d.clearTimeout(a)
    });
    Viva.Graph.Utils.timer = function(a, b) {
        var c, e = function() {
            d.cancelAnimationFrame(c);
            c = 0
        }, m = function() {
            c = d.requestAnimationFrame(m);
            a() || e()
        };
        m();
        return {
            stop: e, restart: function() {
                c || m()
            }
        }
    }
})();
Viva.Graph.geom = function() {
    return {
        intersect: function(b, c, a, d, e, h, f, g) {
            var l, m, k, n, p, q = {x: 0, y: 0};
            l = d - c;
            k = b - a;
            p = a * c - b * d;
            m = l * e + k * h + p;
            n = l * f + k * g + p;
            if (0 !== m && 0 !== n && 0 <= m === 4 <= n) {
                return null;
            }
            m = g - h;
            n = e - f;
            e = f * h - e * g;
            b = m * b + n * c + e;
            a = m * a + n * d + e;
            if (0 !== b && 0 !== a && 0 <= b === 0 <= a) {
                return null;
            }
            a = l * n - m * k;
            if (0 === a) {
                return null;
            }
            k = k * e - n * p;
            q.x = (0 > k ? k - 0 : k + 0) / a;
            k = m * p - l * e;
            q.y = (0 > k ? k - 0 : k + 0) / a;
            return q
        }, intersectRect: function(b, c, a, d, e, h, f, g) {
            return this.intersect(b, c, b, d, e, h, f, g) || this.intersect(b, d, a, d, e, h, f, g) || this.intersect(a,
                    d, a, c, e, h, f, g) || this.intersect(a, c, b, c, e, h, f, g)
        }, convexHull: function(b) {
            var c = function(a, b, c) {
                return 0 > (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)
            };
            if (3 > b.length) {
                return b;
            }
            var a = 0, d;
            for (d = 0; d < b.length; ++d) {
                b[d].y < b[a].y ? a = d : b[d].y === b[a].y && b[d].x < b[a].x && (a = d);
            }
            d = b[a];
            b.splice(a, 1);
            b = function(a, b) {
                var c = function(b) {
                    var c = b.x - a.x;
                    b = b.y - a.y;
                    return (0 < c ? 1 : -1) * c * c / (c * c + b * b)
                }, d = b.sort(function(a, b) {
                    return c(b) - c(a)
                }), e = d[0], k = c(e), n = e.x - a.x, e = e.y - a.y, p = n * n + e * e, q;
                for (q = 1; q < d.length; ++q) {
                    e = d[q], n = c(e), n === k ? (n =
                            e.x - a.x, e = e.y - a.y, e = n * n + e * e, e < p ? d.splice(q, 1) : d.splice(q - 1, 1)) : k = n;
                }
                return d
            }(d, b);
            if (2 > b.length) {
                return b;
            }
            a = [];
            a.push(d);
            a.push(b[0]);
            a.push(b[1]);
            var e = a.length;
            for (d = 2; d < b.length; ++d) {
                for (; !c(a[e - 2], a[e - 1], b[d]);) {
                    a.pop(), --e;
                }
                a.push(b[d]);
                e += 1
            }
            return a
        }
    }
};
Viva.Graph.Rect = function(b, c, a, d) {
    this.x1 = b || 0;
    this.y1 = c || 0;
    this.x2 = a || 0;
    this.y2 = d || 0
};
Viva.Graph.Point2d = function(b, c) {
    this.x = b || 0;
    this.y = c || 0
};
Viva.Graph.Node = function(b) {
    this.id = b;
    this.links = [];
    this.data = null
};
Viva.Graph.Link = function(b, c, a) {
    this.fromId = b;
    this.toId = c;
    this.data = a
};
Viva.Graph.graph = function() {
    var b = {}, c = [], a = 0, d = 0, e = [], h = function(a) {
        --d;
        0 === d && 0 < e.length && (a.fire("changed", e), e.length = 0)
    }, f = function(a, b) {
        e.push({node: a, changeType: b})
    }, g = {
        addNode: function(c, e) {
            if ("undefined" === typeof c) {
                throw{message: "Invalid node identifier"};
            }
            d += 1;
            var k = this.getNode(c);
            k ? f(k, "update") : (k = new Viva.Graph.Node(c), a++, f(k, "add"));
            if (e) {
                var n = k.data || {}, p = typeof e, q;
                if ("string" === p || e && "object" === typeof e && "number" === typeof e.length && "function" === typeof e.splice && !e.propertyIsEnumerable("length") ||
                    "number" === p || "boolean" === p) {
                    n = e;
                } else if ("undefined" === p) {
                    n = null;
                } else {
                    for (q in e) {
                        e.hasOwnProperty(q) && (n[q] = e[q]);
                    }
                }
                k.data = n
            }
            b[c] = k;
            h(this);
            return k
        }, addLink: function(a, b, f) {
            d += 1;
            var n = this.getNode(a) || this.addNode(a), p = this.getNode(b) || this.addNode(b);
            a = new Viva.Graph.Link(a, b, f);
            c.push(a);
            n.links.push(a);
            p.links.push(a);
            e.push({link: a, changeType: "add"});
            h(this);
            return a
        }, removeLink: function(a) {
            if (!a) {
                return !1;
            }
            var b = Viva.Graph.Utils.indexOfElementInArray(a, c);
            if (0 > b) {
                return !1;
            }
            d += 1;
            c.splice(b, 1);
            var f =
                this.getNode(a.fromId), n = this.getNode(a.toId);
            f && (b = Viva.Graph.Utils.indexOfElementInArray(a, f.links), 0 <= b && f.links.splice(b, 1));
            n && (b = Viva.Graph.Utils.indexOfElementInArray(a, n.links), 0 <= b && n.links.splice(b, 1));
            e.push({link: a, changeType: "remove"});
            h(this);
            return !0
        }, removeNode: function(c) {
            var e = this.getNode(c);
            if (!e) {
                return !1;
            }
            for (d += 1; e.links.length;) {
                this.removeLink(e.links[0]);
            }
            b[c] = null;
            delete b[c];
            a--;
            f(e, "remove");
            h(this)
        }, getNode: function(a) {
            return b[a]
        }, getNodesCount: function() {
            return a
        }, getLinksCount: function() {
            return c.length
        },
        getLinks: function(a) {
            return (a = this.getNode(a)) ? a.links : null
        }, forEachNode: function(a) {
            if ("function" === typeof a) {
                for (var c in b) {
                    if (b.hasOwnProperty(c) && a(b[c])) {
                        break
                    }
                }
            }
        }, forEachLinkedNode: function(a, c, d) {
            var e = this.getNode(a), f, q;
            if (e && e.links && "function" === typeof c) {
                if (d) {
                    for (d = 0; d < e.links.length; ++d) {
                        f = e.links[d], f.fromId === a && c(b[f.toId], f);
                    }
                } else {
                    for (d = 0; d < e.links.length; ++d) {
                        f = e.links[d], q = f.fromId === a ? f.toId : f.fromId, c(b[q], f)
                    }
                }
            }
        }, forEachLink: function(a) {
            var b;
            if ("function" === typeof a) {
                for (b = 0; b < c.length; ++b) {
                    a(c[b])
                }
            }
        },
        beginUpdate: function() {
            d += 1
        }, endUpdate: function() {
            h(this)
        }, clear: function() {
            var a = this;
            a.beginUpdate();
            a.forEachNode(function(b) {
                a.removeNode(b.id)
            });
            a.endUpdate()
        }, hasLink: function(a, b) {
            var c = this.getNode(a), d;
            if (!c) {
                return null;
            }
            for (d = 0; d < c.links.length; ++d) {
                var e = c.links[d];
                if (e.fromId === a && e.toId === b) {
                    return e
                }
            }
            return null
        }
    };
    Viva.Graph.Utils.events(g).extend();
    return g
};
Viva.Graph.generator = function() {
    return {
        complete: function(b) {
            if (!b || 1 > b) {
                throw{message: "At least two nodes expected for complete graph"};
            }
            var c = Viva.Graph.graph(), a, d;
            c.Name = "Complete K" + b;
            for (a = 0; a < b; ++a) {
                for (d = a + 1; d < b; ++d) {
                    a !== d && c.addLink(a, d);
                }
            }
            return c
        }, completeBipartite: function(b, c) {
            if (!b || !c || 0 > b || 0 > c) {
                throw{message: "Graph dimensions are invalid. Number of nodes in each partition should be greate than 0"};
            }
            var a = Viva.Graph.graph(), d, e;
            a.Name = "Complete K " + b + "," + c;
            for (d = 0; d < b; ++d) {
                for (e = b; e < b + c; ++e) {
                    a.addLink(d,
                        e);
                }
            }
            return a
        }, ladder: function(b) {
            if (!b || 0 > b) {
                throw{message: "Invalid number of nodes"};
            }
            var c = Viva.Graph.graph(), a;
            c.Name = "Ladder graph " + b;
            for (a = 0; a < b - 1; ++a) {
                c.addLink(a, a + 1), c.addLink(b + a, b + a + 1), c.addLink(a, b + a);
            }
            c.addLink(b - 1, 2 * b - 1);
            return c
        }, circularLadder: function(b) {
            if (!b || 0 > b) {
                throw{message: "Invalid number of nodes"};
            }
            var c = this.ladder(b);
            c.Name = "Circular ladder graph " + b;
            c.addLink(0, b - 1);
            c.addLink(b, 2 * b - 1);
            return c
        }, grid: function(b, c) {
            var a = Viva.Graph.graph(), d, e;
            a.Name = "Grid graph " + b + "x" + c;
            for (d =
                     0; d < b; ++d) {
                for (e = 0; e < c; ++e) {
                    var h = d + e * b;
                    0 < d && a.addLink(h, d - 1 + e * b);
                    0 < e && a.addLink(h, d + (e - 1) * b)
                }
            }
            return a
        }, path: function(b) {
            if (!b || 0 > b) {
                throw{message: "Invalid number of nodes"};
            }
            var c = Viva.Graph.graph(), a;
            c.Name = "Path graph " + b;
            c.addNode(0);
            for (a = 1; a < b; ++a) {
                c.addLink(a - 1, a);
            }
            return c
        }, lollipop: function(b, c) {
            if (!c || 0 > c || !b || 0 > b) {
                throw{message: "Invalid number of nodes"};
            }
            var a = this.complete(b), d;
            a.Name = "Lollipop graph. Head x Path " + b + "x" + c;
            for (d = 0; d < c; ++d) {
                a.addLink(b + d - 1, b + d);
            }
            return a
        }, balancedBinTree: function(b) {
            var c =
                Viva.Graph.graph(), a = Math.pow(2, b);
            c.Name = "Balanced bin tree graph " + b;
            for (b = 1; b < a; ++b) {
                var d = b, e = 2 * d + 1;
                c.addLink(d, 2 * d);
                c.addLink(d, e)
            }
            return c
        }, randomNoLinks: function(b) {
            if (!b || 0 > b) {
                throw{message: "Invalid number of nodes"};
            }
            var c = Viva.Graph.graph(), a;
            c.Name = "Random graph, no Links: " + b;
            for (a = 0; a < b; ++a) {
                c.addNode(a);
            }
            return c
        }
    }
};
Viva.Graph.operations = function() {
    return {
        density: function(b) {
            var c = b.getNodesCount();
            return 0 === c ? NaN : 2 * b.getLinksCount() / (c * (c - 1))
        }
    }
};
Viva.Graph.centrality = function() {
    var b = function(a, b, c) {
        var h = {}, f = [], g = {}, l = {}, m = [b.id], k, n, p, q = function(a) {
            l.hasOwnProperty(a.id) || (m.push(a.id), l[a.id] = n + 1);
            l[a.id] === n + 1 && (g[a.id] += p, h[a.id].push(k))
        };
        a.forEachNode(function(a) {
            h[a.id] = [];
            g[a.id] = 0
        });
        l[b.id] = 0;
        for (g[b.id] = 1; m.length;) {
            k = m.shift(), n = l[k], p = g[k], f.push(k), a.forEachLinkedNode(k, q, c);
        }
        return {S: f, P: h, sigma: g}
    }, c = function(a) {
        var b = [], c;
        for (c in a) {
            a.hasOwnProperty(c) && b.push({key: c, value: a[c]});
        }
        return b.sort(function(a, b) {
            return b.value -
                a.value
        })
    };
    return {
        betweennessCentrality: function(a, d) {
            var e = {}, h;
            a.forEachNode(function(a) {
                e[a.id] = 0
            });
            a.forEachNode(function(c) {
                var d = h = b(a, c), l = {}, m = d.S, k, n, p, q, t;
                for (k = 0; k < m.length; k += 1) {
                    l[m[k]] = 0;
                }
                for (; m.length;) {
                    n = m.pop();
                    p = (1 + l[n]) / d.sigma[n];
                    q = d.P[n];
                    for (k = 0; k < q.length; k += 1) {
                        t = q[k], l[t] += d.sigma[t] * p;
                    }
                    n !== c && (e[n] += l[n])
                }
            });
            return c(e)
        }, degreeCentrality: function(a, b) {
            var c, h = [], f = [], g;
            b = (b || "both").toLowerCase();
            if ("in" === b) {
                c = function(a, b) {
                    var c = 0, d;
                    for (d = 0; d < a.length; d += 1) {
                        c += a[d].toId === b ? 1 : 0;
                    }
                    return c
                };
            } else if ("out" === b) {
                c = function(a, b) {
                    var c = 0, d;
                    for (d = 0; d < a.length; d += 1) {
                        c += a[d].fromId === b ? 1 : 0;
                    }
                    return c
                };
            } else if ("both" === b) {
                c = function(a, b) {
                    return a.length
                };
            } else {
                throw"Expected centrality degree kind is: in, out or both";
            }
            a.forEachNode(function(b) {
                var d = a.getLinks(b.id), d = c(d, b.id);
                h.hasOwnProperty(d) ? h[d].push(b.id) : h[d] = [b.id]
            });
            for (g in h) {
                if (h.hasOwnProperty(g)) {
                    var l = h[g], m;
                    if (l) {
                        for (m = 0; m < l.length; ++m) {
                            f.unshift({key: l[m], value: parseInt(g, 10)})
                        }
                    }
                }
            }
            return f
        }
    }
};
Viva.Graph._community = {};
Viva.Graph._community.slpaAlgorithm = function(b, c, a) {
    c = c || 100;
    a = a || .3;
    var d = Viva.random(1331782216905), e = Viva.random("Greeting goes to you, ", "dear reader"), h = function(a, b) {
        var d = [];
        a.forEachUniqueWord(function(a, e) {
            if (e > b) {
                d.push({name: a, probability: e / c});
            } else {
                return !0
            }
        });
        return d
    }, f = function(a) {
        var b = [];
        a.forEachNode(function(a) {
            var c = Viva.Graph._community.occuranceMap(d);
            c.add(a.id);
            a.slpa = {memory: c};
            b.push(a.id)
        });
        return b
    }, g = function(a, b) {
        var f = Viva.randomIterator(b, e), g, q = function(b) {
            var c = a.getNode(b),
                e = Viva.Graph._community.occuranceMap(d);
            a.forEachLinkedNode(b, function(a) {
                a = a.slpa.memory.getRandomWord();
                e.add(a)
            });
            b = e.getMostPopularFair();
            c.slpa.memory.add(b)
        };
        for (g = 0; g < c - 1; ++g) {
            f.forEach(q)
        }
    }, l = function(b) {
        var d = {};
        b.forEachNode(function(b) {
            var e = h(b.slpa.memory, a * c), f;
            for (f = 0; f < e.length; ++f) {
                var g = e[f].name;
                d.hasOwnProperty(g) ? d[g].push(b.id) : d[g] = [b.id]
            }
            b.communities = e;
            b.slpa = null;
            delete b.slpa
        });
        return d
    };
    return {
        run: function() {
            var a = f(b);
            g(b, a);
            return l(b)
        }
    }
};
Viva.Graph._community.occuranceMap = function(b) {
    b = b || Viva.random();
    var c = {}, a = [], d = !1, e = [], h = function() {
        var a;
        e.length = 0;
        for (a in c) {
            c.hasOwnProperty(a) && e.push(a);
        }
        e.sort(function(a, b) {
            var d = c[b] - c[a];
            return d ? d : a < b ? -1 : a > b ? 1 : 0
        })
    };
    return {
        add: function(b) {
            b = String(b);
            c.hasOwnProperty(b) ? c[b] += 1 : c[b] = 1;
            a.push(b);
            d = !0
        }, getWordCount: function(a) {
            return c[a] || 0
        }, getMostPopularFair: function() {
            if (1 === a.length) {
                return a[0];
            }
            d && (h(), d = !1);
            var f = 0, g;
            for (g = 1; g < e.length && c[e[g - 1]] === c[e[g]]; ++g) {
                f += 1;
            }
            return e[b.next(f +
                1)]
        }, getRandomWord: function() {
            if (0 === a.length) {
                throw"The occurance map is empty. Cannot get empty word";
            }
            return a[b.next(a.length)]
        }, forEachUniqueWord: function(a) {
            if ("function" !== typeof a) {
                throw"Function callback is expected to enumerate all words";
            }
            var b;
            d && (h(), d = !1);
            for (b = 0; b < e.length; ++b) {
                var l = e[b];
                if (a(l, c[l])) {
                    break
                }
            }
        }
    }
};
Viva.Graph.community = function() {
    return {
        slpa: function(b, c, a) {
            return Viva.Graph._community.slpaAlgorithm(b, c, a).run()
        }
    }
};
Viva.Graph.Physics = Viva.Graph.Physics || {};
Viva.Graph.Physics.Vector = function(b, c) {
    this.x = b || 0;
    this.y = c || 0
};
Viva.Graph.Physics.Vector.prototype = {
    multiply: function(b) {
        return new Viva.Graph.Physics.Vector(this.x * b, this.y * b)
    }
};
Viva.Graph.Physics.Point = function(b, c) {
    this.x = b || 0;
    this.y = c || 0
};
Viva.Graph.Physics.Point.prototype = {
    add: function(b) {
        return new Viva.Graph.Physics.Point(this.x + b.x, this.y + b.y)
    }
};
Viva.Graph.Physics.Body = function() {
    this.mass = 1;
    this.force = new Viva.Graph.Physics.Vector;
    this.velocity = new Viva.Graph.Physics.Vector;
    this.location = new Viva.Graph.Physics.Point;
    this.prevLocation = new Viva.Graph.Physics.Point
};
Viva.Graph.Physics.Body.prototype = {
    loc: function(b) {
        return b ? (this.location.x = b.x, this.location.y = b.y, this) : this.location
    }, vel: function(b) {
        return b ? (this.velocity.x = b.x, this.velocity.y = b.y, this) : this.velocity
    }
};
Viva.Graph.Physics.Spring = function(b, c, a, d, e) {
    this.body1 = b;
    this.body2 = c;
    this.length = a;
    this.coeff = d;
    this.weight = e
};
Viva.Graph.Physics.QuadTreeNode = function() {
    this.centerOfMass = new Viva.Graph.Physics.Point;
    this.children = [];
    this.body = null;
    this.hasChildren = !1;
    this.y2 = this.x2 = this.y1 = this.x1 = 0
};
Viva.Graph.Physics = Viva.Graph.Physics || {};
Viva.Graph.Physics.eulerIntegrator = function() {
    return {
        integrate: function(b, c) {
            var a = b.speedLimit, d = 0, e = 0, h, f = b.bodies.length;
            for (h = 0; h < f; ++h) {
                var g = b.bodies[h], d = c / g.mass;
                g.velocity.x += d * g.force.x;
                g.velocity.y += d * g.force.y;
                var d = g.velocity.x, e = g.velocity.y, l = Math.sqrt(d * d + e * e);
                l > a && (g.velocity.x = a * d / l, g.velocity.y = a * e / l);
                d = c * g.velocity.x;
                e = c * g.velocity.y;
                g.location.x += d;
                g.location.y += e
            }
            return d * d + e * e
        }
    }
};
Viva.Graph.Physics.nbodyForce = function(b) {
    b = Viva.lazyExtend(b || {gravity: -1, theta: .8});
    var c = b.gravity, a = [], d = b.theta, e = Viva.random("5f4dcc3b5aa765d61d8327deb882cf99", 75, 20, 63, 108, 65, 76, 65, 72), h = function() {
        this.body = null;
        this.quads = [];
        this.right = this.bottom = this.top = this.left = this.massY = this.massX = this.mass = 0;
        this.isInternal = !1
    }, f = [], g = 0, l = function() {
        var a;
        f[g] ? (a = f[g], a.quads[0] = null, a.quads[1] = null, a.quads[2] = null, a.quads[3] = null, a.body = null, a.mass = a.massX = a.massY = 0, a.left = a.right = a.top = a.bottom =
                0, a.isInternal = !1) : (a = new h, f[g] = a);
        ++g;
        return a
    }, m = l(), k = function(a) {
        for (a = [{node: m, body: a}]; a.length;) {
            var b = a.shift(), c = b.node, b = b.body;
            if (c.isInternal) {
                var d = b.location.x, f = b.location.y;
                c.mass += b.mass;
                c.massX += b.mass * d;
                c.massY += b.mass * f;
                var g = 0, k = c.left, h = (c.right + k) / 2, u = c.top, y = (c.bottom + u) / 2;
                d > h && (g += 1, d = k, k = h, h += h - d);
                f > y && (g += 2, f = u, u = y, y += y - f);
                f = c.quads[g];
                f || (f = l(), f.left = k, f.top = u, f.right = h, f.bottom = y, c.quads[g] = f);
                a.unshift({node: f, body: b})
            } else if (c.body) {
                g = c.body;
                c.body = null;
                c.isInternal = !0;
                k = g.location;
                h = b.location;
                u = Math.abs(k.y - h.y);
                if (.01 > Math.abs(k.x - h.x) && .01 > u) {
                    do {
                        k = 2 * e.nextDouble() * Math.PI, h = .006 * (c.bottom - c.top) * Math.sin(k), k = g.location.x + .006 * (c.right - c.left) * Math.cos(k), h = g.location.y + h;
                    } while (k < c.left || k > c.right || h < c.top || h > c.bottom);
                    g.location.x = k;
                    g.location.y = h
                }
                a.unshift({node: c, body: g});
                a.unshift({node: c, body: b})
            } else {
                c.body = b
            }
        }
    };
    return {
        insert: k, init: function(a) {
            var b = Number.MAX_VALUE, c = Number.MAX_VALUE, d = Number.MIN_VALUE, e = Number.MIN_VALUE, f;
            a = a.bodies;
            var h = a.length;
            for (f = h; f--;) {
                var r = a[f].location.x, u = a[f].location.y;
                r < b && (b = r);
                r > d && (d = r);
                u < c && (c = u);
                u > e && (e = u)
            }
            f = d - b;
            r = e - c;
            f > r ? e = c + f : d = b + r;
            g = 0;
            m = l();
            m.left = b;
            m.right = d;
            m.top = c;
            m.bottom = e;
            for (f = h; f--;) {
                k(a[f], m)
            }
        }, update: function(b) {
            var f, g, k, h = 1, l = 0, x = 1;
            for (a[0] = m; h;) {
                var r = a[l], u = r.body, h = h - 1, l = l + 1;
                u && u !== b ? (g = u.location.x - b.location.x, k = u.location.y - b.location.y, f = Math.sqrt(g * g + k * k), 0 === f && (g = (e.nextDouble() - .5) / 50, k = (e.nextDouble() - .5) / 50, f = Math.sqrt(g * g + k * k)), f = c * u.mass * b.mass / (f * f * f), b.force.x += f * g, b.force.y +=
                        f * k) : (g = r.massX / r.mass - b.location.x, k = r.massY / r.mass - b.location.y, f = Math.sqrt(g * g + k * k), 0 === f && (g = (e.nextDouble() - .5) / 50, k = (e.nextDouble() - .5) / 50, f = Math.sqrt(g * g + k * k)), (r.right - r.left) / f < d ? (f = c * r.mass * b.mass / (f * f * f), b.force.x += f * g, b.force.y += f * k) : (r.quads[0] && (a[x] = r.quads[0], h += 1, x += 1), r.quads[1] && (a[x] = r.quads[1], h += 1, x += 1), r.quads[2] && (a[x] = r.quads[2], h += 1, x += 1), r.quads[3] && (a[x] = r.quads[3], h += 1, x += 1)))
            }
        }, options: function(a) {
            return a ? ("number" === typeof a.gravity && (c = a.gravity), "number" === typeof a.theta &&
                (d = a.theta), this) : {gravity: c, theta: d}
        }
    }
};
Viva.Graph.Physics.dragForce = function(b) {
    b || (b = {});
    var c = {coeff: b.coeff || .01};
    return {
        init: function(a) {
        }, update: function(a) {
            a.force.x -= c.coeff * a.velocity.x;
            a.force.y -= c.coeff * a.velocity.y
        }, options: function(a) {
            return a ? ("number" === typeof a.coeff && (c.coeff = a.coeff), this) : c
        }
    }
};
Viva.Graph.Physics.springForce = function(b) {
    b = Viva.lazyExtend(b, {length: 50, coeff: 2.2E-4});
    var c = Viva.random("Random number 4.", "Chosen by fair dice roll");
    return {
        init: function(a) {
        }, update: function(a) {
            var d = a.body1, e = a.body2, h = 0 > a.length ? b.length : a.length, f = e.location.x - d.location.x, g = e.location.y - d.location.y, l = Math.sqrt(f * f + g * g);
            0 === l && (f = (c.nextDouble() - .5) / 50, g = (c.nextDouble() - .5) / 50, l = Math.sqrt(f * f + g * g));
            a = (!a.coeff || 0 > a.coeff ? b.coeff : a.coeff) * (l - h) / l * a.weight;
            d.force.x += a * f;
            d.force.y += a * g;
            e.force.x +=
                -a * f;
            e.force.y += -a * g
        }, options: function(a) {
            return a ? ("number" === typeof a.length && (b.length = a.length), "number" === typeof a.coeff && (b.coeff = a.coeff), this) : b
        }
    }
};
Viva.Graph.Physics = Viva.Graph.Physics || {};
Viva.Graph.Physics.forceSimulator = function(b) {
    var c = b || Viva.Graph.Physics.rungeKuttaIntegrator(), a = [], d = [], e = [], h = [];
    return {
        speedLimit: 1, bodies: a, accumulate: function() {
            var b, c, l;
            for (b = e.length; b--;) {
                e[b].init(this);
            }
            for (b = h.length; b--;) {
                h[b].init(this);
            }
            for (b = a.length; b--;) {
                for (l = a[b], l.force.x = 0, c = l.force.y = 0; c < e.length; c++) {
                    e[c].update(l);
                }
            }
            for (b = 0; b < d.length; ++b) {
                for (c = 0; c < h.length; c++) {
                    h[c].update(d[b])
                }
            }
        }, run: function(a) {
            this.accumulate();
            return c.integrate(this, a)
        }, addBody: function(b) {
            if (!b) {
                throw{message: "Cannot add null body to force simulator"};
            }
            a.push(b);
            return b
        }, removeBody: function(b) {
            if (!b) {
                return !1;
            }
            b = Viva.Graph.Utils.indexOfElementInArray(b, a);
            return 0 > b ? !1 : a.splice(b, 1)
        }, addSpring: function(a, b, c, e, k) {
            if (!a || !b) {
                throw{message: "Cannot add null spring to force simulator"};
            }
            if ("number" !== typeof c) {
                throw{message: "Spring length should be a number"};
            }
            a = new Viva.Graph.Physics.Spring(a, b, c, 0 <= e ? e : -1, "number" === typeof k ? k : 1);
            d.push(a);
            return a
        }, removeSpring: function(a) {
            if (!a) {
                return !1;
            }
            a = Viva.Graph.Utils.indexOfElementInArray(a, d);
            return 0 > a ? !1 : d.splice(a,
                    1)
        }, addBodyForce: function(a) {
            if (!a) {
                throw{message: "Cannot add mighty (unknown) force to the simulator"};
            }
            e.push(a)
        }, addSpringForce: function(a) {
            if (!a) {
                throw{message: "Cannot add unknown force to the simulator"};
            }
            h.push(a)
        }
    }
};
Viva.Graph.Layout = Viva.Graph.Layout || {};
Viva.Graph.Layout.forceDirected = function(b, c) {
    if (!b) {
        throw{message: "Graph structure cannot be undefined"};
    }
    c = Viva.lazyExtend(c, {springLength: 80, springCoeff: 2E-4, gravity: -1.2, theta: .8, dragCoeff: .02});
    var a = Viva.Graph.Physics.forceSimulator(Viva.Graph.Physics.eulerIntegrator()), d = Viva.Graph.Physics.nbodyForce({
        gravity: c.gravity,
        theta: c.theta
    }), e = Viva.Graph.Physics.springForce({
        length: c.springLength,
        coeff: c.springCoeff
    }), h = Viva.Graph.Physics.dragForce({coeff: c.dragCoeff}), f = !0, g = new Viva.Graph.Rect, l =
        Viva.random("ted.com", 103, 114, 101, 97, 116), m = function(a) {
        a.force_directed_body.mass = 1 + b.getLinks(a.id).length / 3
    }, k = function(d) {
        var e = d.force_directed_body;
        if (!e) {
            if (!(e = d.position)) {
                var e = (g.x1 + g.x2) / 2, f = (g.y1 + g.y2) / 2, k = c.springLength;
                if (d.links && 0 < d.links.length) {
                    var h = d.links[0], h = h.fromId !== d.id ? b.getNode(h.fromId) : b.getNode(h.toId);
                    h.position && (e = h.position.x, f = h.position.y)
                }
                e = {x: e + l.next(k) - k / 2, y: f + l.next(k) - k / 2}
            }
            d.position = e;
            e = new Viva.Graph.Physics.Body;
            d.force_directed_body = e;
            m(d);
            e.loc(d.position);
            a.addBody(e)
        }
    }, n = function(c) {
        var d = b.getNode(c.fromId), e = b.getNode(c.toId);
        m(d);
        m(e);
        c.force_directed_spring = a.addSpring(d.force_directed_body, e.force_directed_body, -1, c.weight)
    }, p = function() {
        var a = Number.MAX_VALUE, c = Number.MAX_VALUE, d = Number.MIN_VALUE, e = Number.MIN_VALUE;
        0 !== b.getNodesCount() && (b.forEachNode(function(b) {
            var f = b.force_directed_body;
            if (f) {
                var k;
                k = b ? b.isPinned || b.data && b.data.isPinned : !0;
                k && f.loc(b.position);
                b.position.x = f.location.x;
                b.position.y = f.location.y;
                b.position.x < a && (a = b.position.x);
                b.position.x > d && (d = b.position.x);
                b.position.y < c && (c = b.position.y);
                b.position.y > e && (e = b.position.y)
            }
        }), g.x1 = a, g.x2 = d, g.y1 = c, g.y2 = e)
    };
    a.addSpringForce(e);
    a.addBodyForce(d);
    a.addBodyForce(h);
    return {
        run: function(a) {
            var b;
            a = a || 50;
            for (b = 0; b < a; ++b) {
                this.step()
            }
        }, step: function() {
            f && (b.forEachNode(k), b.forEachLink(n), f = !1);
            var c = a.run(20);
            p();
            return .001 > c
        }, getGraphRect: function() {
            return g
        }, addNode: function(a) {
            k(a)
        }, removeNode: function(b) {
            var c = b.force_directed_body;
            c && (b.force_directed_body = null, delete b.force_directed_body,
                a.removeBody(c))
        }, addLink: function(a) {
            n(a)
        }, removeLink: function(c) {
            var d = c.force_directed_spring;
            if (d) {
                var e = b.getNode(c.fromId), f = b.getNode(c.toId);
                e && m(e);
                f && m(f);
                c.force_directed_spring = null;
                delete c.force_directed_spring;
                a.removeSpring(d)
            }
        }, dispose: function() {
            f = !0
        }, springLength: function(a) {
            return 1 === arguments.length ? (e.options({length: a}), this) : e.options().length
        }, springCoeff: function(a) {
            return 1 === arguments.length ? (e.options({coeff: a}), this) : e.options().coeff
        }, gravity: function(a) {
            return 1 ===
            arguments.length ? (d.options({gravity: a}), this) : d.options().gravity
        }, theta: function(a) {
            return 1 === arguments.length ? (d.options({theta: a}), this) : d.options().theta
        }, drag: function(a) {
            return 1 === arguments.length ? (h.options({coeff: a}), this) : h.options().coeff
        }
    }
};
Viva.Graph.Layout = Viva.Graph.Layout || {};
Viva.Graph.Layout.constant = function(b, c) {
    c = Viva.lazyExtend(c, {maxX: 1024, maxY: 1024, seed: "Deterministic randomness made me do this"});
    var a = Viva.random(c.seed), d = new Viva.Graph.Rect, e = function(b) {
        return new Viva.Graph.Point2d(a.next(c.maxX), a.next(c.maxY))
    }, h = function() {
        var a = Number.MAX_VALUE, c = Number.MAX_VALUE, h = Number.MIN_VALUE, m = Number.MIN_VALUE;
        0 !== b.getNodesCount() && (b.forEachNode(function(b) {
            b.hasOwnProperty("position") || (b.position = e(b));
            b.position.x < a && (a = b.position.x);
            b.position.x > h && (h = b.position.x);
            b.position.y < c && (c = b.position.y);
            b.position.y > m && (m = b.position.y)
        }), d.x1 = a, d.x2 = h, d.y1 = c, d.y2 = m)
    };
    return {
        run: function(a) {
            this.step()
        }, step: function() {
            h();
            return !1
        }, getGraphRect: function() {
            return d
        }, addNode: function(a) {
        }, removeNode: function(a) {
        }, addLink: function(a) {
        }, removeLink: function(a) {
        }, dispose: function() {
        }, placeNode: function(a) {
            return "function" === typeof a ? (e = a, h(), this) : e(a)
        }
    }
};
Viva.Graph.View = Viva.Graph.View || {};
Viva.Graph.View.cssGraphics = function() {
    var b, c, a, d = function() {
            var a;
            switch (Viva.BrowserInfo.browser) {
                case "mozilla":
                    a = "Moz";
                    break;
                case "webkit":
                    a = "webkit";
                    break;
                case "opera":
                    a = "O";
                    break;
                case "msie":
                    if (a = Viva.BrowserInfo.version.split(".")[0], 8 < a) {
                        a = "ms";
                    } else {
                        return "OLD_IE"
                    }
            }
            return a ? a + "Transform" : null
        }(), e = function() {
            return "OLD_IE" === d ? function(a, b, c, d) {
                    var e = Math.cos(d), f = Math.sin(d);
                    0 > d && (d = 2 * Math.PI + d);
                    d < Math.PI / 2 ? (a.style.left = b + "px", a.style.top = c + "px") : d < Math.PI ? (a.style.left = b - a.clientWidth * Math.cos(Math.PI -
                                    d), a.style.top = c) : (a.style.left = d < Math.PI + Math.PI / 2 ? b - a.clientWidth * Math.cos(Math.PI - d) : b, a.style.top = c + a.clientWidth * Math.sin(Math.PI - d));
                    a.style.filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11=" + e + ", M12=" + -f + ",M21=" + f + ", M22=" + e + ");"
                } : d ? function(a, b, c, e) {
                        a.style.left = b + "px";
                        a.style.top = c + "px";
                        a.style[d] = "rotate(" + e + "rad)";
                        a.style[d + "Origin"] = "left"
                    } : function(a, b, c, d) {
                    }
        }(), h = function(a) {
            a = window.document.createElement("div");
            a.setAttribute("class", "node");
            return a
        },
        f = function(a, b) {
            a.style.left = b.x - 5 + "px";
            a.style.top = b.y - 5 + "px"
        }, g = function(a, b, c) {
            var d = b.x - c.x;
            b = b.y - c.y;
            var f = Math.sqrt(d * d + b * b);
            a.style.height = "1px";
            a.style.width = f + "px";
            e(a, c.x, c.y, Math.atan2(b, d))
        }, l = function(a) {
            a = window.document.createElement("div");
            a.setAttribute("class", "link");
            return a
        }, m = function() {
            if (b) {
                if (d && "OLD_IE" !== d) {
                    b.style[d] = "matrix(1, 0, 0,1," + c + "," + a + ")";
                } else {
                    throw"Not implemented. TODO: Implement OLD_IE Filter based transform";
                }
            }
        };
    return {
        node: function(a) {
            if (a && "function" !== typeof a) {
                return h(a);
            }
            h = a;
            return this
        }, link: function(a) {
            if (a && "function" !== typeof a) {
                return l(a);
            }
            l = a;
            return this
        }, inputManager: Viva.Input.domInputManager, graphCenterChanged: function(b, d) {
            c = b;
            a = d;
            m()
        }, translateRel: function(b, d) {
            c += b;
            a += d;
            m()
        }, scale: function(a, b) {
            return 1
        }, resetScale: function() {
            return this
        }, beginRender: function() {
        }, endRender: function() {
        }, placeNode: function(a) {
            f = a;
            return this
        }, placeLink: function(a) {
            g = a;
            return this
        }, init: function(a) {
            b = a;
            m()
        }, initLink: function(a) {
            0 < b.childElementCount ? b.insertBefore(a, b.firstChild) :
                b.appendChild(a)
        }, releaseLink: function(a) {
            b.removeChild(a)
        }, initNode: function(a) {
            b.appendChild(a)
        }, releaseNode: function(a) {
            b.removeChild(a)
        }, updateNodePosition: function(a, b) {
            f(a, b)
        }, updateLinkPosition: function(a, b, c) {
            g(a, b, c)
        }
    }
};
Viva.Graph.svg = function(b) {
    var c = b;
    "string" === typeof b && (c = window.document.createElementNS("http://www.w3.org/2000/svg", b));
    if (c.vivagraph_augmented) {
        return c;
    }
    c.vivagraph_augmented = !0;
    c.attr = function(a, b) {
        return 2 === arguments.length ? (null !== b ? c.setAttributeNS(null, a, b) : c.removeAttributeNS(null, a), c) : c.getAttributeNS(null, a)
    };
    c.append = function(a) {
        a = Viva.Graph.svg(a);
        c.appendChild(a);
        return a
    };
    c.text = function(a) {
        return "undefined" !== typeof a ? (c.textContent = a, c) : c.textContent
    };
    c.link = function(a) {
        return arguments.length ?
            (c.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", a), c) : c.getAttributeNS("http://www.w3.org/1999/xlink", "xlink:href")
    };
    c.children = function(a) {
        var b = [], e = c.childNodes.length, h, f;
        if (void 0 === a && c.hasChildNodes()) {
            for (h = 0; h < e; h++) {
                b.push(Viva.Graph.svg(c.childNodes[h]));
            }
        } else if ("string" === typeof a) {
            var g = "." === a[0], l = "#" === a[0], m = !g && !l;
            for (h = 0; h < e; h++) {
                var k = c.childNodes[h];
                if (1 === k.nodeType) {
                    var n = k.attr("class");
                    f = k.attr("id");
                    var p = k.nodeName;
                    if (g && n) {
                        for (n = n.replace(/\s+/g, " ").split(" "),
                                 f = 0; f < n.length; f++) {
                            if (g && n[f] === a.substr(1)) {
                                b.push(Viva.Graph.svg(k));
                                break
                            }
                        }
                    } else if (l && f === a.substr(1)) {
                        b.push(Viva.Graph.svg(k));
                        break
                    } else {
                        m && p === a && b.push(Viva.Graph.svg(k));
                    }
                    b = b.concat(Viva.Graph.svg(k).children(a))
                }
            }
            if (l && 1 === b.length) {
                return b[0]
            }
        }
        return b
    };
    return c
};
Viva.Graph.View = Viva.Graph.View || {};
Viva.Graph.View.svgGraphics = function() {
    var b, c, a, d, e = 1, h = function(a) {
        return Viva.Graph.svg("rect").attr("width", 10).attr("height", 10).attr("fill", "#00a2e8")
    }, f = function(a, b) {
        a.attr("x", b.x - 5).attr("y", b.y - 5)
    }, g = function(a) {
        return Viva.Graph.svg("line").attr("stroke", "#999")
    }, l = function(a, b, c) {
        a.attr("x1", b.x).attr("y1", b.y).attr("x2", c.x).attr("y2", c.y)
    }, m = function() {
        b && b.attr("transform", "matrix(" + e + ", 0, 0," + e + "," + a + "," + d + ")")
    }, k = {
        node: function(a) {
            if (a && "function" !== typeof a) {
                return h(a);
            }
            h = a;
            return this
        },
        link: function(a) {
            if (a && "function" !== typeof a) {
                return g(a);
            }
            g = a;
            return this
        }, placeNode: function(a) {
            f = a;
            return this
        }, placeLink: function(a) {
            l = a;
            return this
        }, beginRender: function() {
        }, endRender: function() {
        }, graphCenterChanged: function(b, c) {
            a = b;
            d = c;
            m()
        }, inputManager: Viva.Input.domInputManager, translateRel: function(a, d) {
            var e = c.createSVGPoint(), f = b.getCTM(), h = c.createSVGPoint().matrixTransform(f.inverse());
            e.x = a;
            e.y = d;
            e = e.matrixTransform(f.inverse());
            e.x = (e.x - h.x) * f.a;
            e.y = (e.y - h.y) * f.d;
            f.e += e.x;
            f.f += e.y;
            b.attr("transform",
                "matrix(" + f.a + ", 0, 0," + f.d + "," + f.e + "," + f.f + ")")
        }, scale: function(f, h) {
            var g = c.createSVGPoint();
            g.x = h.x;
            g.y = h.y;
            g = g.matrixTransform(b.getCTM().inverse());
            g = c.createSVGMatrix().translate(g.x, g.y).scale(f).translate(-g.x, -g.y);
            g = b.getCTM().multiply(g);
            e = g.a;
            a = g.e;
            d = g.f;
            b.attr("transform", "matrix(" + g.a + ", 0, 0," + g.d + "," + g.e + "," + g.f + ")");
            this.fire("rescaled");
            return e
        }, resetScale: function() {
            e = 1;
            b.attr("transform", "matrix(1, 0, 0, 1, 0, 0)");
            this.fire("rescaled");
            return this
        }, init: function(a) {
            c = Viva.Graph.svg("svg");
            b = Viva.Graph.svg("g").attr("buffered-rendering", "dynamic");
            c.appendChild(b);
            a.appendChild(c);
            m()
        }, release: function(a) {
            c && a && a.removeChild(c)
        }, initLink: function(a) {
            a && (0 < b.childElementCount ? b.insertBefore(a, b.firstChild) : b.appendChild(a))
        }, releaseLink: function(a) {
            b.removeChild(a)
        }, initNode: function(a) {
            b.appendChild(a)
        }, releaseNode: function(a) {
            b.removeChild(a)
        }, updateNodePosition: function(a, b) {
            f(a, b)
        }, updateLinkPosition: function(a, b, c) {
            l(a, b, c)
        }, getSvgRoot: function() {
            return c
        }
    };
    Viva.Graph.Utils.events(k).extend();
    return k
};
Viva.Graph.View.svgNodeFactory = function(b) {
    var c = Viva.Graph.geom(), a = function(a, b) {
        a.size = {w: 10, h: 10};
        a.append("rect").attr("width", a.size.w).attr("height", a.size.h).attr("stroke", "orange").attr("fill", "orange")
    }, d = function(a) {
        return a.size
    };
    return {
        node: function(b) {
            var c = Viva.Graph.svg("g");
            a(c, b);
            c.nodeId = b.id;
            return c
        }, link: function(a) {
            if ((a = (a = b.getNode(a.fromId)) && a.ui) && !a.linksContainer) {
                var c = Viva.Graph.svg("path").attr("stroke", "#999");
                return a.linksContainer = c
            }
            return null
        }, customContent: function(b, c) {
            if ("function" !== typeof b || "function" !== typeof c) {
                throw"Two functions expected: contentCreator(nodeUI, node) and size(nodeUI)";
            }
            a = b;
            d = c
        }, placeNode: function(a, h) {
            var f = "", g = d(a);
            b.forEachLinkedNode(a.nodeId, function(b, m) {
                if (b.position && b.ui && b.ui !== a && m.fromId === a.nodeId) {
                    var k = d(b.ui), n = b.position, p = c.intersectRect(h.x - g.w / 2, h.y - g.h / 2, h.x + g.w / 2, h.y + g.h / 2, h.x, h.y, n.x, n.y) || h, k = c.intersectRect(n.x - k.w / 2, n.y - k.h / 2, n.x + k.w / 2, n.y + k.h / 2, n.x, n.y, h.x, h.y) || n;
                    f += "M" + Math.round(p.x) + " " + Math.round(p.y) + "L" + Math.round(k.x) + " " +
                        Math.round(k.y)
                }
            });
            a.attr("transform", "translate(" + (h.x - g.w / 2) + ", " + (h.y - g.h / 2) + ")");
            "" !== f && a.linksContainer && a.linksContainer.attr("d", f)
        }
    }
};
Viva.Graph.webgl = function(b) {
    var c = function(a, c) {
        var e = b.createShader(c);
        b.shaderSource(e, a);
        b.compileShader(e);
        if (!b.getShaderParameter(e, b.COMPILE_STATUS)) {
            throw e = b.getShaderInfoLog(e), window.alert(e), e;
        }
        return e
    };
    return {
        createProgram: function(a, d) {
            var e = b.createProgram(), h = c(a, b.VERTEX_SHADER), f = c(d, b.FRAGMENT_SHADER);
            b.attachShader(e, h);
            b.attachShader(e, f);
            b.linkProgram(e);
            if (!b.getProgramParameter(e, b.LINK_STATUS)) {
                throw e = b.getShaderInfoLog(e), window.alert(e), e;
            }
            return e
        }, extendArray: function(a,
                                 b, c) {
            return (b + 1) * c > a.length ? (b = new Float32Array(a.length * c * 2), b.set(a), b) : a
        }, copyArrayPart: function(a, b, c, h) {
            var f;
            for (f = 0; f < h; ++f) {
                a[b + f] = a[c + f]
            }
        }, swapArrayPart: function(a, b, c, h) {
            var f;
            for (f = 0; f < h; ++f) {
                var g = a[b + f];
                a[b + f] = a[c + f];
                a[c + f] = g
            }
        }, getLocations: function(a, c) {
            var e = {}, h;
            for (h = 0; h < c.length; ++h) {
                var f = c[h], g;
                if (0 === f.indexOf("a_")) {
                    g = b.getAttribLocation(a, f);
                    if (-1 === g) {
                        throw"Program doesn't have required attribute: " + f;
                    }
                    e[f.slice(2)] = g
                } else if (0 === f.indexOf("u_")) {
                    g = b.getUniformLocation(a, f);
                    if (null ===
                        g) {
                        throw"Program doesn't have required uniform: " + f;
                    }
                    e[f.slice(2)] = g
                } else {
                    throw"Couldn't figure out your intent. All uniforms should start with 'u_' prefix, and attributes with 'a_'";
                }
            }
            return e
        }, context: b
    }
};
Viva.Graph.View.WebglUtils = function() {
};
Viva.Graph.View.WebglUtils.prototype.parseColor = function(b) {
    var c = 10414335;
    if ("string" === typeof b && b) {
        if (4 === b.length && (b = b.replace(/([^#])/g, "$1$1")), 9 === b.length) {
            c = parseInt(b.substr(1), 16);
        } else if (7 === b.length) {
            c = parseInt(b.substr(1), 16) << 8 | 255;
        } else {
            throw'Color expected in hex format with preceding "#". E.g. #00ff00. Got value: ' + b;
        }
    } else {
        "number" === typeof b && (c = b);
    }
    return c
};
Viva.Graph.View._webglUtil = new Viva.Graph.View.WebglUtils;
Viva.Graph.View.webglLine = function(b) {
    return {color: Viva.Graph.View._webglUtil.parseColor(b)}
};
Viva.Graph.View.webglSquare = function(b, c) {
    return {size: "number" === typeof b ? b : 10, color: Viva.Graph.View._webglUtil.parseColor(c)}
};
Viva.Graph.View.webglImage = function(b, c) {
    return {_texture: 0, _offset: 0, size: "number" === typeof b ? b : 32, src: c}
};
Viva.Graph.View.webglNodeProgram = function() {
    var b = 3 * Float32Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT, c, a, d, e, h, f = new ArrayBuffer(16 * b), g = new Float32Array(f), l = new Uint32Array(f), m = 0, k, n, p, q;
    return {
        load: function(b) {
            a = b;
            h = Viva.Graph.webgl(b);
            c = h.createProgram("attribute vec3 a_vertexPos;\nattribute vec4 a_color;\nuniform vec2 u_screenSize;\nuniform mat4 u_transform;\nvarying vec4 color;\nvoid main(void) {\n   gl_Position = u_transform * vec4(a_vertexPos.xy/u_screenSize, 0, 1);\n   gl_PointSize = a_vertexPos.z * u_transform[0][0];\n   color = a_color.abgr;\n}", "precision mediump float;\nvarying vec4 color;\nvoid main(void) {\n   gl_FragColor = color;\n}");
            a.useProgram(c);
            e = h.getLocations(c, ["a_vertexPos", "a_color", "u_screenSize", "u_transform"]);
            a.enableVertexAttribArray(e.vertexPos);
            a.enableVertexAttribArray(e.color);
            d = a.createBuffer()
        }, position: function(a, b) {
            var c = a.id;
            g[4 * c] = b.x;
            g[4 * c + 1] = b.y;
            g[4 * c + 2] = a.size;
            l[4 * c + 3] = a.color
        }, updateTransform: function(a) {
            q = !0;
            p = a
        }, updateSize: function(a, b) {
            k = a;
            n = b;
            q = !0
        }, createNode: function(a) {
            if ((m + 1) * b >= f.byteLength) {
                a = new ArrayBuffer(2 * f.byteLength);
                var c = new Float32Array(a), d = new Uint32Array(a);
                d.set(l);
                g = c;
                l = d;
                f = a
            }
            m += 1
        }, removeNode: function(a) {
            0 < m && --m;
            a.id < m && 0 < m && h.copyArrayPart(l, 4 * a.id, 4 * m, 4)
        }, replaceProperties: function(a, b) {
        }, render: function() {
            a.useProgram(c);
            a.bindBuffer(a.ARRAY_BUFFER, d);
            a.bufferData(a.ARRAY_BUFFER, f, a.DYNAMIC_DRAW);
            q && (q = !1, a.uniformMatrix4fv(e.transform, !1, p), a.uniform2f(e.screenSize, k, n));
            a.vertexAttribPointer(e.vertexPos, 3, a.FLOAT, !1, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
            a.vertexAttribPointer(e.color, 4, a.UNSIGNED_BYTE, !0, 4 * Float32Array.BYTES_PER_ELEMENT, 12);
            a.drawArrays(a.POINTS,
                0, m)
        }
    }
};
Viva.Graph.View.webglLinkProgram = function() {
    var b = 2 * (2 * Float32Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT), c, a, d, e, h, f = 0, g, l = new ArrayBuffer(16 * b), m = new Float32Array(l), k = new Uint32Array(l), n, p, q, t;
    return {
        load: function(b) {
            a = b;
            e = Viva.Graph.webgl(b);
            c = e.createProgram("attribute vec2 a_vertexPos;\nattribute vec4 a_color;\nuniform vec2 u_screenSize;\nuniform mat4 u_transform;\nvarying vec4 color;\nvoid main(void) {\n   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0.0, 1.0);\n   color = a_color.abgr;\n}", "precision mediump float;\nvarying vec4 color;\nvoid main(void) {\n   gl_FragColor = color;\n}");
            a.useProgram(c);
            h = e.getLocations(c, ["a_vertexPos", "a_color", "u_screenSize", "u_transform"]);
            a.enableVertexAttribArray(h.vertexPos);
            a.enableVertexAttribArray(h.color);
            d = a.createBuffer()
        }, position: function(a, b, c) {
            var d = 6 * a.id;
            m[d] = b.x;
            m[d + 1] = b.y;
            k[d + 2] = a.color;
            m[d + 3] = c.x;
            m[d + 4] = c.y;
            k[d + 5] = a.color
        }, createLink: function(a) {
            if ((f + 1) * b > l.byteLength) {
                var c = new ArrayBuffer(2 * l.byteLength), d = new Float32Array(c), e = new Uint32Array(c);
                e.set(k);
                m = d;
                k = e;
                l = c
            }
            f += 1;
            g = a.id
        }, removeLink: function(a) {
            0 < f && --f;
            a.id < f && 0 <
            f && e.copyArrayPart(k, 6 * a.id, 6 * f, 6)
        }, updateTransform: function(a) {
            t = !0;
            q = a
        }, updateSize: function(a, b) {
            n = a;
            p = b;
            t = !0
        }, render: function() {
            a.useProgram(c);
            a.bindBuffer(a.ARRAY_BUFFER, d);
            a.bufferData(a.ARRAY_BUFFER, l, a.DYNAMIC_DRAW);
            t && (t = !1, a.uniformMatrix4fv(h.transform, !1, q), a.uniform2f(h.screenSize, n, p));
            a.vertexAttribPointer(h.vertexPos, 2, a.FLOAT, !1, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
            a.vertexAttribPointer(h.color, 4, a.UNSIGNED_BYTE, !0, 3 * Float32Array.BYTES_PER_ELEMENT, 8);
            a.drawArrays(a.LINES, 0, 2 * f);
            g =
                f - 1
        }, bringToFront: function(a) {
            g > a.id && e.swapArrayPart(m, 6 * a.id, 6 * g, 6);
            0 < g && --g
        }, getFrontLinkId: function() {
            return g
        }
    }
};
Viva.Graph.View.Texture = function(b) {
    this.canvas = window.document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.isDirty = !1;
    this.canvas.width = this.canvas.height = b
};
Viva.Graph.View.webglAtlas = function(b) {
    var c = Math.sqrt(b || 1024) << 0, a = 1, d = {}, e, h = 0, f = [], g = [], l, m = function(a) {
        var d = a % b;
        return {textureNumber: a / b << 0, row: d / c << 0, col: d % c}
    }, k = function() {
        l.isDirty = !0;
        h = 0;
        e = null
    }, n = function() {
        e && (window.clearTimeout(e), h += 1, e = null);
        10 < h ? k() : e = window.setTimeout(k, 400)
    };
    if (0 !== (b & b - 1)) {
        throw"Tiles per texture should be power of two.";
    }
    return l = {
        isDirty: !1, clearDirty: function() {
            var a;
            this.isDirty = !1;
            for (a = 0; a < f.length; ++a) {
                f[a].isDirty = !1
            }
        }, remove: function(b) {
            var e = d[b];
            if (!e) {
                return !1;
            }
            delete d[b];
            --a;
            if (a === e.offset) {
                return !0;
            }
            b = m(e.offset);
            var h = m(a);
            f[b.textureNumber].ctx.drawImage(f[h.textureNumber].canvas, h.col * c, h.row * c, c, c, b.col * c, b.row * c, c, c);
            f[h.textureNumber].isDirty = !0;
            f[b.textureNumber].isDirty = !0;
            d[g[a]].offset = e.offset;
            g[e.offset] = g[a];
            n();
            return !0
        }, getTextures: function() {
            return f
        }, getCoordinates: function(a) {
            return d[a]
        }, load: function(b, e) {
            if (d.hasOwnProperty(b)) {
                e(d[b]);
            } else {
                var h = new window.Image, l = a;
                a += 1;
                h.crossOrigin = "anonymous";
                h.onload = function() {
                    n();
                    var a = m(l),
                        b = {offset: l};
                    if (a.textureNumber >= f.length) {
                        var k = new Viva.Graph.View.Texture(c * c);
                        f.push(k)
                    }
                    k = f[a.textureNumber];
                    k.ctx.drawImage(h, a.col * c, a.row * c, c, c);
                    g[l] = h.src;
                    d[h.src] = b;
                    k.isDirty = !0;
                    e(b)
                };
                h.src = b
            }
        }
    }
};
Viva.Graph.View.webglImageNodeProgram = function() {
    var b, c, a, d, e, h, f = 0, g = new Float32Array(64), l, m, k, n;
    return {
        load: function(f) {
            a = f;
            e = Viva.Graph.webgl(f);
            b = new Viva.Graph.View.webglAtlas(1024);
            c = e.createProgram("attribute vec2 a_vertexPos;\nattribute float a_customAttributes;\nuniform vec2 u_screenSize;\nuniform mat4 u_transform;\nuniform float u_tilesPerTexture;\nvarying vec3 vTextureCoord;\nvoid main(void) {\n   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);\nfloat corner = mod(a_customAttributes, 4.);\nfloat tileIndex = mod(floor(a_customAttributes / 4.), u_tilesPerTexture);\nfloat tilesPerRow = sqrt(u_tilesPerTexture);\nfloat tileSize = 1./tilesPerRow;\nfloat tileColumn = mod(tileIndex, tilesPerRow);\nfloat tileRow = floor(tileIndex/tilesPerRow);\nif(corner == 0.0) {\n  vTextureCoord.xy = vec2(0, 1);\n} else if(corner == 1.0) {\n  vTextureCoord.xy = vec2(1, 1);\n} else if(corner == 2.0) {\n  vTextureCoord.xy = vec2(0, 0);\n} else {\n  vTextureCoord.xy = vec2(1, 0);\n}\nvTextureCoord *= tileSize;\nvTextureCoord.x += tileColumn * tileSize;\nvTextureCoord.y += tileRow * tileSize;\nvTextureCoord.z = floor(floor(a_customAttributes / 4.)/u_tilesPerTexture);\n}", "precision mediump float;\nvarying vec4 color;\nvarying vec3 vTextureCoord;\nuniform sampler2D u_sampler0;\nuniform sampler2D u_sampler1;\nuniform sampler2D u_sampler2;\nuniform sampler2D u_sampler3;\nvoid main(void) {\n   if (vTextureCoord.z == 0.) {\n     gl_FragColor = texture2D(u_sampler0, vTextureCoord.xy);\n   } else if (vTextureCoord.z == 1.) {\n     gl_FragColor = texture2D(u_sampler1, vTextureCoord.xy);\n   } else if (vTextureCoord.z == 2.) {\n     gl_FragColor = texture2D(u_sampler2, vTextureCoord.xy);\n   } else if (vTextureCoord.z == 3.) {\n     gl_FragColor = texture2D(u_sampler3, vTextureCoord.xy);\n   } else { gl_FragColor = vec4(0, 1, 0, 1); }\n}");
            a.useProgram(c);
            h = e.getLocations(c, "a_vertexPos a_customAttributes u_screenSize u_transform u_sampler0 u_sampler1 u_sampler2 u_sampler3 u_tilesPerTexture".split(" "));
            a.uniform1f(h.tilesPerTexture, 1024);
            a.enableVertexAttribArray(h.vertexPos);
            a.enableVertexAttribArray(h.customAttributes);
            d = a.createBuffer()
        }, position: function(a, b) {
            var c = 18 * a.id;
            g[c] = b.x - a.size;
            g[c + 1] = b.y - a.size;
            g[c + 2] = 4 * a._offset;
            g[c + 3] = b.x + a.size;
            g[c + 4] = b.y - a.size;
            g[c + 5] = 4 * a._offset + 1;
            g[c + 6] = b.x - a.size;
            g[c + 7] = b.y + a.size;
            g[c + 8] = 4 * a._offset +
                2;
            g[c + 9] = b.x - a.size;
            g[c + 10] = b.y + a.size;
            g[c + 11] = 4 * a._offset + 2;
            g[c + 12] = b.x + a.size;
            g[c + 13] = b.y - a.size;
            g[c + 14] = 4 * a._offset + 1;
            g[c + 15] = b.x + a.size;
            g[c + 16] = b.y + a.size;
            g[c + 17] = 4 * a._offset + 3
        }, createNode: function(a) {
            g = e.extendArray(g, f, 18);
            f += 1;
            var c = b.getCoordinates(a.src);
            c ? a._offset = c.offset : (a._offset = 0, b.load(a.src, function(b) {
                    a._offset = b.offset
                }))
        }, removeNode: function(a) {
            0 < f && --f;
            a.id < f && 0 < f && (a.src && b.remove(a.src), e.copyArrayPart(g, 18 * a.id, 18 * f, 18))
        }, replaceProperties: function(a, b) {
            b._offset = a._offset
        },
        updateTransform: function(a) {
            n = !0;
            k = a
        }, updateSize: function(a, b) {
            l = a;
            m = b;
            n = !0
        }, render: function() {
            a.useProgram(c);
            a.bindBuffer(a.ARRAY_BUFFER, d);
            a.bufferData(a.ARRAY_BUFFER, g, a.DYNAMIC_DRAW);
            n && (n = !1, a.uniformMatrix4fv(h.transform, !1, k), a.uniform2f(h.screenSize, l, m));
            a.vertexAttribPointer(h.vertexPos, 2, a.FLOAT, !1, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
            a.vertexAttribPointer(h.customAttributes, 1, a.FLOAT, !1, 3 * Float32Array.BYTES_PER_ELEMENT, 8);
            if (b.isDirty) {
                var e = b.getTextures(), q;
                for (q = 0; q < e.length; ++q) {
                    if (e[q].isDirty || !e[q].nativeObject) {
                        var t = e[q], v = q;
                        t.nativeObject && a.deleteTexture(t.nativeObject);
                        var w = a.createTexture();
                        a.activeTexture(a["TEXTURE" + v]);
                        a.bindTexture(a.TEXTURE_2D, w);
                        a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, t.canvas);
                        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
                        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR_MIPMAP_NEAREST);
                        a.generateMipmap(a.TEXTURE_2D);
                        a.uniform1i(h["sampler" + v], v);
                        t.nativeObject = w
                    }
                }
                b.clearDirty()
            }
            a.drawArrays(a.TRIANGLES, 0, 6 * f)
        }
    }
};
Viva.Graph.View = Viva.Graph.View || {};
Viva.Graph.View.webglGraphics = function(b) {
    b = Viva.lazyExtend(b, {
        enableBlending: !0,
        preserveDrawingBuffer: !1,
        clearColor: !1,
        clearColorValue: {r: 1, g: 1, b: 1, a: 1}
    });
    var c, a, d, e, h, f = 0, g = 0, l, m, k, n = [], p = [], q, t = Viva.Graph.View.webglLinkProgram(), v = Viva.Graph.View.webglNodeProgram(), w = function(a) {
        return Viva.Graph.View.webglSquare()
    }, x = function(a) {
        return Viva.Graph.View.webglLine(3014898687)
    }, r = function() {
        t.updateTransform(l);
        v.updateTransform(l)
    }, u = function() {
        l = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    }, y = function() {
        c &&
        a && (e = a.width = Math.max(c.offsetWidth, 1), h = a.height = Math.max(c.offsetHeight, 1), d && d.viewport(0, 0, e, h), t && t.updateSize(e / 2, h / 2), v && v.updateSize(e / 2, h / 2))
    }, z = {
        node: function(a) {
            if (a && "function" !== typeof a) {
                var b = f++, c = w(a);
                c.id = b;
                v.createNode(c);
                n[b] = a;
                return c
            }
            w = a;
            return this
        }, link: function(a) {
            if (a && "function" !== typeof a) {
                var b = g++, c = x(a);
                c.id = b;
                t.createLink(c);
                p[b] = a;
                return c
            }
            x = a;
            return this
        }, placeNode: function(a) {
            m = a;
            return this
        }, placeLink: function(a) {
            k = a;
            return this
        }, inputManager: Viva.Input.webglInputManager,
        beginRender: function() {
        }, endRender: function() {
            0 < g && t.render();
            0 < f && v.render()
        }, bringLinkToFront: function(a) {
            var b = t.getFrontLinkId(), c;
            t.bringToFront(a);
            b > a.id && (a = a.id, c = p[b], p[b] = p[a], p[b].ui.id = b, p[a] = c, p[a].ui.id = a)
        }, graphCenterChanged: function(a, b) {
            y()
        }, translateRel: function(a, b) {
            l[12] += 2 * l[0] * a / e / l[0];
            l[13] -= 2 * l[5] * b / h / l[5];
            r()
        }, scale: function(a, b) {
            var c = 2 * b.x / e - 1, d = 1 - 2 * b.y / h, c = c - l[12], d = d - l[13];
            l[12] += c * (1 - a);
            l[13] += d * (1 - a);
            l[0] *= a;
            l[5] *= a;
            r();
            this.fire("rescaled");
            return l[0]
        }, resetScale: function() {
            u();
            d && (y(), r());
            return this
        }, init: function(f) {
            var g = {};
            b.preserveDrawingBuffer && (g.preserveDrawingBuffer = !0);
            c = f;
            a = window.document.createElement("canvas");
            y();
            u();
            c.appendChild(a);
            d = a.getContext("experimental-webgl", g);
            if (!d) {
                throw window.alert("Could not initialize WebGL. Seems like the browser doesn't support it."), "Could not initialize WebGL. Seems like the browser doesn't support it.";
            }
            b.enableBlending && (d.blendFunc(d.SRC_ALPHA, d.ONE_MINUS_SRC_ALPHA), d.enable(d.BLEND));
            b.clearColor && (f = b.clearColorValue,
                d.clearColor(f.r, f.g, f.b, f.a), this.beginRender = function() {
                d.clear(d.COLOR_BUFFER_BIT)
            });
            t.load(d);
            t.updateSize(e / 2, h / 2);
            v.load(d);
            v.updateSize(e / 2, h / 2);
            r();
            "function" === typeof q && q(a)
        }, release: function(b) {
            a && b && b.removeChild(a)
        }, isSupported: function() {
            var a = window.document.createElement("canvas");
            return a && a.getContext && a.getContext("experimental-webgl")
        }, initLink: function(a) {
        }, releaseLink: function(a) {
            0 < g && --g;
            t.removeLink(a);
            a = a.id;
            a < g && 0 !== g && g !== a && (p[a] = p[g], p[a].ui.id = a)
        }, initNode: function(a) {
        },
        releaseNode: function(a) {
            0 < f && --f;
            v.removeNode(a);
            if (a.id < f && (a = a.id, 0 !== f && f !== a)) {
                var b = n[f], c = n[a];
                n[a] = b;
                n[a].ui.id = a;
                v.replaceProperties(c.ui, b.ui)
            }
        }, updateNodePosition: function(a, b) {
            b.y = -b.y;
            m && m(a, b);
            v.position(a, b)
        }, updateLinkPosition: function(a, b, c) {
            b.y = -b.y;
            c.y = -c.y;
            k && k(a, b, c);
            t.position(a, b, c)
        }, getGraphicsRoot: function(b) {
            "function" === typeof b && (a ? b(a) : q = b);
            return a
        }, setNodeProgram: function(a) {
            if (!d && a) {
                v = a;
            } else if (a) {
                throw"Not implemented. Cannot swap shader on the fly... yet.";
            }
        }, setLinkProgram: function(a) {
            if (!d &&
                a) {
                t = a;
            } else if (a) {
                throw"Not implemented. Cannot swap shader on the fly... yet.";
            }
        }, getGraphCoordinates: function(a) {
            a.x = 2 * a.x / e - 1;
            a.y = 1 - 2 * a.y / h;
            a.x = (a.x - l[12]) / l[0];
            a.y = (a.y - l[13]) / l[5];
            a.x *= e / 2;
            a.y *= -h / 2;
            return a
        }
    };
    Viva.Graph.Utils.events(z).extend();
    return z
};
Viva.Graph.webglInputEvents = function(b, c) {
    if (b.webglInputEvents) {
        return b.webglInputEvents;
    }
    var a = null, d = Viva.Graph.spatialIndex(c, function(a, b, c) {
        if (a.ui && a.ui.size) {
            var d = a.position;
            a = a.ui.size;
            return d.x - a < b && b < d.x + a && d.y - a < c && c < d.y + a
        }
        return !0
    }), e = [], h = [], f = [], g = [], l = [], m = [], k = [], n = Viva.Graph.Utils.events(window.document), p, q, t = function(a) {
        a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0
    }, v = function(a) {
        t(a);
        return !1
    }, w = function(a, b) {
        var c, d;
        for (c = 0; c < a.length; c += 1) {
            if (d = a[c].apply(void 0, b)) {
                return !0
            }
        }
    };
    b.getGraphicsRoot(function(c) {
        var r = {x: 0, y: 0}, u = null, y = +new Date, z = function(a) {
            w(l, [u, a]);
            r.x = a.clientX;
            r.y = a.clientY
        }, A = function(a) {
            n.stop("mousemove", z);
            n.stop("mouseup", A)
        }, B = function() {
            q = c.getBoundingClientRect()
        };
        window.addEventListener("resize", B);
        B();
        c.addEventListener("mousemove", function(c) {
            if (!a) {
                var f = !1, g;
                r.x = c.clientX - q.left;
                r.y = c.clientY - q.top;
                b.getGraphCoordinates(r);
                (g = d.getNodeAt(r.x, r.y)) && u !== g ? (u = g, f = f || w(e, [u])) : null === g && u !== g && (f = f || w(h, [u]), u = null);
                f && t(c)
            }
        });
        c.addEventListener("mousedown",
            function(a) {
                var c = !1, e;
                r.x = a.clientX - q.left;
                r.y = a.clientY - q.top;
                b.getGraphCoordinates(r);
                e = [d.getNodeAt(r.x, r.y), a];
                e[0] ? (c = w(f, e), n.on("mousemove", z), n.on("mouseup", A), p = window.document.onselectstart, window.document.onselectstart = v, u = e[0]) : u = null;
                c && t(a)
            });
        c.addEventListener("mouseup", function(a) {
            var c = +new Date, e;
            r.x = a.clientX - q.left;
            r.y = a.clientY - q.top;
            b.getGraphCoordinates(r);
            e = [d.getNodeAt(r.x, r.y), a];
            e[0] && (window.document.onselectstart = p, 400 > c - y && e[0] === u ? w(k, e) : w(m, e), y = c, w(g, e) && t(a))
        })
    });
    b.webglInputEvents = {
        mouseEnter: function(a) {
            "function" === typeof a && e.push(a);
            return this
        }, mouseLeave: function(a) {
            "function" === typeof a && h.push(a);
            return this
        }, mouseDown: function(a) {
            "function" === typeof a && f.push(a);
            return this
        }, mouseUp: function(a) {
            "function" === typeof a && g.push(a);
            return this
        }, mouseMove: function(a) {
            "function" === typeof a && l.push(a);
            return this
        }, click: function(a) {
            "function" === typeof a && m.push(a);
            return this
        }, dblClick: function(a) {
            "function" === typeof a && k.push(a);
            return this
        }, mouseCapture: function(b) {
            a =
                b
        }, releaseMouseCapture: function(b) {
            a = null
        }
    };
    return b.webglInputEvents
};
Viva.Input = Viva.Input || {};
Viva.Input.webglInputManager = function(b, c) {
    var a = Viva.Graph.webglInputEvents(c, b), d = null, e = {}, h = {x: 0, y: 0};
    a.mouseDown(function(b, c) {
        d = b;
        h.x = c.clientX;
        h.y = c.clientY;
        a.mouseCapture(d);
        var l = e[b.ui.id];
        if (l && l.onStart) {
            l.onStart(c, h);
        }
        return !0
    }).mouseUp(function(b) {
        a.releaseMouseCapture(d);
        d = null;
        if ((b = e[b.ui.id]) && b.onStop) {
            b.onStop();
        }
        return !0
    }).mouseMove(function(a, b) {
        if (d) {
            var c = e[d.ui.id];
            if (c && c.onDrag) {
                c.onDrag(b, {x: b.clientX - h.x, y: b.clientY - h.y});
            }
            h.x = b.clientX;
            h.y = b.clientY;
            return !0
        }
    });
    return {
        bindDragNDrop: function(a,
                                b) {
            e[a.ui.id] = b
        }
    }
};
Viva.Graph.View = Viva.Graph.View || {};
Viva.Graph.View.renderer = function(b, c) {
    c = c || {};
    var a = c.layout, d = c.graphics, e = c.container, h, f, g = !1, l = !0, m = !1, k = !1, n = 0, p = 0, q = 0, t = 0, v = 1, w = {
        x: 0,
        y: 0,
        node: null
    }, x = {x: 0, y: 0, node: null}, r = {x: 0, y: 0}, u = Viva.Graph.Utils.events(window), y, z, A = function(a) {
        var c = b.getNode(a.fromId), e = b.getNode(a.toId);
        c && e && (w.x = c.position.x, w.y = c.position.y, w.node = c, x.x = e.position.x, x.y = e.position.y, x.node = e, d.updateLinkPosition(a.ui, w, x))
    }, B = function(a) {
        r.x = a.position.x;
        r.y = a.position.y;
        d.updateNodePosition(a.ui, r)
    }, C = function() {
        d.beginRender();
        c.renderLinks && !d.omitLinksRendering && b.forEachLink(A);
        b.forEachNode(B);
        d.endRender()
    }, E = function() {
        m = a.step() && !k;
        C();
        return !m
    }, N = function(a) {
        f || (f = a ? Viva.Graph.Utils.timer(function() {
                return E()
            }, 30) : Viva.Graph.Utils.timer(E, 30))
    }, D = function() {
        var b = a.getGraphRect(), c = Viva.Graph.Utils.getDimension(e);
        n = p = 0;
        q = c.width / 2 - (b.x2 + b.x1) / 2;
        t = c.height / 2 - (b.y2 + b.y1) / 2;
        d.graphCenterChanged(q + n, t + p);
        l = !1
    }, F = function(b) {
        var c = d.node(b);
        b.ui = c;
        d.initNode(c);
        a.addNode(b);
        B(b)
    }, G = function(b) {
        b.hasOwnProperty("ui") &&
        (d.releaseNode(b.ui), b.ui = null, delete b.ui);
        a.removeNode(b)
    }, H = function(a) {
        var b = d.link(a);
        a.ui = b;
        d.initLink(b);
        d.omitLinksRendering || A(a)
    }, I = function(a) {
        a.hasOwnProperty("ui") && (d.releaseLink(a.ui), a.ui = null, delete a.ui)
    }, J = function(a) {
        var b = !1;
        h.bindDragNDrop(a, {
            onStart: function() {
                b = a.isPinned;
                k = a.isPinned = !0;
                m = !1;
                f.restart()
            }, onDrag: function(b, c) {
                a.position.x += c.x / v;
                a.position.y += c.y / v;
                k = !0;
                C()
            }, onStop: function() {
                a.isPinned = b;
                k = !1
            }
        })
    }, K = function(d) {
        var e, g;
        for (e = 0; e < d.length; e += 1) {
            if (g = d[e], g.node) {
                var k =
                    g.node;
                if ("add" === g.changeType) {
                    F(k), J(k), l && D();
                } else if ("remove" === g.changeType) {
                    h.bindDragNDrop(k, null), G(k), 0 === b.getNodesCount() && (l = !0);
                } else if ("update" === g.changeType) {
                    throw"Update type is not implemented. TODO: Implement me!";
                }
            } else if (g.link) {
                if (k = g.link, "add" === g.changeType) {
                    c.renderLinks && H(k), a.addLink(k);
                } else if ("remove" === g.changeType) {
                    c.renderLinks && I(k), a.removeLink(k);
                } else if ("update" === g.changeType) {
                    throw"Update type is not implemented. TODO: Implement me!";
                }
            }
        }
        m = !1;
        f.restart()
    }, L = function() {
        D();
        E()
    }, M = function() {
        y && (y.stop("changed", K), y = null)
    }, O = function() {
        u.on("resize", L);
        z && (z.release(), z = null);
        z = Viva.Graph.Utils.dragndrop(e);
        z.onDrag(function(a, b) {
            n += b.x;
            p += b.y;
            d.translateRel(b.x, b.y);
            C()
        });
        z.onScroll(function(a, b, c) {
            v = d.scale(Math.pow(1.4, 0 > b ? -.2 : .2), c);
            C()
        });
        b.forEachNode(J);
        M();
        y = Viva.Graph.Utils.events(b);
        y.on("changed", K)
    }, P = function() {
        g = !1;
        M();
        z && (z.release(), z = null);
        u.stop("resize", L);
        f.stop();
        b.forEachLink(function(b) {
            c.renderLinks && I(b);
            a.removeLink(b)
        });
        b.forEachNode(function(a) {
            h.bindDragNDrop(a,
                null);
            G(a)
        });
        a.dispose();
        d.release(e)
    };
    return {
        run: function(f) {
            if (!g) {
                e = e || window.document.body;
                a = a || Viva.Graph.Layout.forceDirected(b);
                d = d || Viva.Graph.View.svgGraphics(b, {container: e});
                c.hasOwnProperty("renderLinks") || (c.renderLinks = !0);
                c.prerender = c.prerender || 0;
                h = (d.inputManager || Viva.Input.domInputManager)(b, d);
                var k;
                if ("number" === typeof c.prerender && 0 < c.prerender) {
                    for (k = 0; k < c.prerender; k += 1) {
                        a.step();
                    }
                } else {
                    a.step();
                }
                D();
                d.init(e);
                b.forEachNode(F);
                c.renderLinks && b.forEachLink(H);
                O();
                g = !0
            }
            N(f);
            return this
        },
        reset: function() {
            d.resetScale();
            D();
            v = 1
        }, pause: function() {
            f.stop()
        }, resume: function() {
            f.restart()
        }, rerender: function() {
            C();
            return this
        }, dispose: function() {
            P()
        }
    }
};
Viva.Graph.serializer = function() {
    var b = function() {
        if ("undefined" === typeof JSON || !JSON.stringify || !JSON.parse) {
            throw"JSON serializer is not defined.";
        }
    }, c = function(a) {
        return {id: a.id, data: a.data}
    }, a = function(a) {
        return {fromId: a.fromId, toId: a.toId, data: a.data}
    }, d = function(a) {
        return a
    }, e = function(a) {
        return a
    };
    return {
        storeToJSON: function(d, e, g) {
            if (!d) {
                throw"Graph is not defined";
            }
            b();
            e = e || c;
            g = g || a;
            var l = {nodes: [], links: []};
            d.forEachNode(function(a) {
                l.nodes.push(e(a))
            });
            d.forEachLink(function(a) {
                l.links.push(g(a))
            });
            return JSON.stringify(l)
        }, loadFromJSON: function(a, c, g) {
            if ("string" !== typeof a) {
                throw"String expected in loadFromJSON() method";
            }
            b();
            c = c || d;
            g = g || e;
            a = JSON.parse(a);
            var l = Viva.Graph.graph(), m;
            if (!a || !a.nodes || !a.links) {
                throw"Passed json string does not represent valid graph";
            }
            for (m = 0; m < a.nodes.length; ++m) {
                var k = c(a.nodes[m]);
                if (!k.hasOwnProperty("id")) {
                    throw"Graph node format is invalid. Node.id is missing";
                }
                l.addNode(k.id, k.data)
            }
            for (m = 0; m < a.links.length; ++m) {
                c = g(a.links[m]);
                if (!c.hasOwnProperty("fromId") || !c.hasOwnProperty("toId")) {
                    throw"Graph link format is invalid. Both fromId and toId are required";
                }
                l.addLink(c.fromId, c.toId, c.data)
            }
            return l
        }
    }
};
module.exports = Viva;

    function Cart() {
        var a = this;
        a.phiShip = 35000;
        a.nextId = 1;
        a.Version = "2.2";
        a.Shelf = null;
        a.items = {};
        a.isLoaded = !1;
        a.pageIsReady = !1;
        a.quantity = 0;
        a.total = 0;
        a.taxRate = 0;
        a.taxCost = 0;
        a.shippingFlatRate = 0;
        a.shippingTotalRate = 0;
        a.shippingQuantityRate = 0;
        a.shippingRate = 0;
        a.shippingCost = 0;
        a.currency = IDR;
        a.checkoutTo = PayPal;
        a.email = "";
        a.merchantId = "";
        a.successUrl = "";
        a.cancelUrl = null;
        a.entry = "";
        a.entryURL = "";
        a.entryDelete = !1;
        a.cookieDuration = 30;
        a.storagePrefix = "sc_";
        a.MAX_COOKIE_SIZE = 4E3;
        a.cartHeaders = "thumb_image Name size Price decrement Quantity increment total Remove".split(" ");
        1 == a.entryDelete && (this.items = {});
        a.add = function(b) {
            this.pageIsReady || (this.initializeView(), this.update());
            this.isLoaded || (this.load(), this.update());
            var a = new CartItem;
            if (!arguments || 0 === arguments.length) return null;
            var d = arguments;
            b && "string" !== typeof b && "number" !== typeof b && (d = b);
            a.parseValuesFromArray(d);
            a.checkQuantityAndPrice();
            this.hasItem(a) ? (d = this.hasItem(a), d.quantity = parseInt(d.quantity, 10) + parseInt(a.quantity, 10), a = d) : this.items[a.id] = a;
            this.update();
            $("html, body").animate({
                    scrollTop: 0
                },
                1E3);
            return a
        };
        a.remove = function(b) {
            var c = {};
            a.each(function(a) {
                a.id !== b && (c[a.id] = a)
            });
            this.items = c
        };
        a.empty = function() {
            simpleCart.items = {};
            simpleCart.update()
        };
        a.find = function(b) {
            if (!b) return null;
            var c = [];
            a.each(function(d, e, g) {
                fits = !0;
                a.each(b, function(b, a, c) {
                    d[c] && d[c] == b || (fits = !1)
                });
                fits && c.push(d)
            });
            return 0 === c.length ? null : c
        };
        a.each = function(b, c) {
            var d, e = 0,
                g;
            if ("function" === typeof b) var n = b,
                p = a.items;
            else if ("function" === typeof c) var n = c,
                p = b;
            else return;
            for (d in p)
                if ("function" !== typeof p[d]) {
                    g =
                        n.call(a, p[d], e, d);
                    if (!1 === g) break;
                    e++
                }
        };
        a.chunk = function(b, a) {
            "undefined" === typeof a && (a = 2);
            return b.match(RegExp(".{1," + a + "}", "g")) || []
        };
        a.checkout = function() {
            if (0 === simpleCart.quantity) error("Cart is empty");
            else switch (simpleCart.checkoutTo) {
                case PayPal:
                    simpleCart.paypalCheckout();
                    break;
                case GoogleCheckout:
                    simpleCart.googleCheckout();
                    break;
                case Email:
                    simpleCart.emailCheckout();
                    break;
                default:
                    simpleCart.customCheckout()
            }
        };
        a.paypalCheckout = function() {
            var b = this,
                a = "https://www.paypal.com/cgi-bin/webscr?cmd=_cart&upload=1&business=" +
                b.email + "&currency_code=" + b.currency,
                d = 1,
                e = "",
                g;
            b.taxRate && (a = a + "&tax_cart=" + b.currencyStringForPaypalCheckout(b.taxCost));
            b.each(function(a, c) {
                d = c + 1;
                g = "";
                b.each(a, function(a, b, d) {
                    "id" !== d && "price" !== d && "quantity" !== d && "name" !== d && "shipping" !== d && (g = g + ", " + d + "=" + a)
                });
                g = g.substring(2);
                e = e + "&item_name_" + d + "=" + a.name + "&item_number_" + d + "=" + d + "&quantity_" + d + "=" + a.quantity + "&amount_" + d + "=" + b.currencyStringForPaypalCheckout(a.price) + "&on0_" + d + "=Options&os0_" + d + "=" + g
            });
            0 !== b.shipping() && (e = e + "&shipping=" +
                b.currencyStringForPaypalCheckout(b.shippingCost));
            b.successUrl && (e = e + "&return=" + b.successUrl);
            b.cancelUrl && (e = e + "&cancel_return=" + b.cancelUrl);
            window.open(a + e, "paypal", "scrollbars,location,resizable,status")
        };
        a.googleCheckout = function() {
            var a = this;
            if (a.currency !== USD && a.currency !== GBP) error("Google Checkout only allows the USD and GBP for currency.");
            else if ("" !== a.merchantId && null !== a.merchantId && a.merchantId) {
                var c = document.createElement("form"),
                    d = 1,
                    e;
                c.style.display = "none";
                c.method = "POST";
                c.action =
                    "https://checkout.google.com/api/checkout/v2/checkoutForm/Merchant/" + a.merchantId;
                c.acceptCharset = "utf-8";
                a.each(function(g, n) {
                    d = n + 1;
                    c.appendChild(a.createHiddenElement("item_name_" + d, g.name));
                    c.appendChild(a.createHiddenElement("item_quantity_" + d, g.quantity));
                    c.appendChild(a.createHiddenElement("item_price_" + d, g.price));
                    c.appendChild(a.createHiddenElement("item_currency_" + d, a.currency));
                    c.appendChild(a.createHiddenElement("item_tax_rate_" + d, a.taxRate));
                    c.appendChild(a.createHiddenElement("_charset_",
                        ""));
                    e = "";
                    a.each(g, function(a, b, d) {
                        "id" !== d && "quantity" !== d && "price" !== d && (e = e + ", " + d + ": " + a)
                    });
                    e = e.substring(1);
                    c.appendChild(a.createHiddenElement("item_description_" + d, e))
                });
                0 !== a.shipping() && (c.appendChild(a.createHiddenElement("ship_method_name_1", "Shipping")), c.appendChild(a.createHiddenElement("ship_method_price_1", parseFloat(a.shippingCost).toFixed(2))), c.appendChild(a.createHiddenElement("ship_method_currency_1", a.currency)));
                document.body.appendChild(c);
                c.submit();
                document.body.removeChild(c)
            } else error("No merchant Id for google checkout supplied.")
        };
        a.emailCheckout = function() {
            this.entryURL = "'+urlmuangay+'";
            window.open(this.entryURL, "_parent")
        };
        a.customCheckout = function() {
            var a = "https://www.nganluong.vn/button_payment.php?receiver=" + this.email,
                c = "",
                d = 0;
            this.each(function(a, b) {
                c = "" == c ? "&product_name=" + a.name : c + (" , " + a.name);
                d += a.price * a.quantity;
                1 < a.quantity && (c += " x " + a.quantity)
            });
            d = "&price=" + d;
            this.successUrl && (c = c + "&return_url=" + this.successUrl);
            a = a + encodeURI(c) + d + "&comments=Thanh%20to%C3%A1n%20%C4%91%E1%BA%B7t%20h%C3%A0ng%20tr%E1%BB%B1c%20tuy%E1%BA%BFn";
            window.open(a, "Ngan Luong", "scrollbars,location,resizable,status")
        };
        a.load = function() {
            this.items = {};
            this.quantity = this.total = 0;
            if (readCookie(simpleCart.storagePrefix + "simpleCart_chunks")) {
                var a = 1 * readCookie(simpleCart.storagePrefix + "simpleCart_chunks"),
                    c = [],
                    d;
                d = "";
                if (0 < a) {
                    for (d = 0; d < a; d++) c.push(readCookie(simpleCart.storagePrefix + "simpleCart_" + (1 + d)));
                    d = unescape(c.join(""));
                    d = d.split("++")
                }
                for (var e = 0, g = d.length; e < g; e++) a = d[e].split("||"), c = new CartItem, c.parseValuesFromArray(a) && (c.checkQuantityAndPrice(),
                    this.items[c.id] = c)
            }
            this.isLoaded = !0
        };
        a.save = function() {
            for (var b = "", c = [], c = 0, c = 1 * readCookie(simpleCart.storagePrefix + "simpleCart_chunks"), d = 0; d < c; d++) eraseCookie(simpleCart.storagePrefix + "simpleCart_" + d);
            eraseCookie(simpleCart.storagePrefix + "simpleCart_chunks");
            a.each(function(a) {
                b = b + "++" + a.print()
            });
            for (var c = simpleCart.chunk(b.substring(2), simpleCart.MAX_COOKIE_SIZE), d = 0, e = c.length; d < e; d++) createCookie(simpleCart.storagePrefix + "simpleCart_" + (1 + d), c[d], a.cookieDuration);
            createCookie(simpleCart.storagePrefix +
                "simpleCart_chunks", "" + c.length, a.cookieDuration)
        };
        a.initializeView = function() {
            this.totalOutlets = getElementsByClassName("simpleCart_total");
            this.quantityOutlets = getElementsByClassName("simpleCart_quantity");
            this.cartDivs = getElementsByClassName("simpleCart_items");
            this.taxCostOutlets = getElementsByClassName("simpleCart_taxCost");
            this.taxRateOutlets = getElementsByClassName("simpleCart_taxRate");
            this.shippingCostOutlets = getElementsByClassName("simpleCart_shippingCost");
            this.finalTotalOutlets = getElementsByClassName("simpleCart_finalTotal");
            this.addEventToArray(getElementsByClassName("simpleCart_checkout"), simpleCart.checkout, "click");
            this.addEventToArray(getElementsByClassName("simpleCart_empty"), simpleCart.empty, "click");
            this.Shelf = new Shelf;
            this.Shelf.readPage();
            this.pageIsReady = !0
        };
        a.updateView = function() {
            a.updateViewTotals();
            a.cartDivs && 0 < a.cartDivs.length && a.updateCartView()
        };
        a.updateViewTotals = function() {
            for (var b = [
                    ["quantity", "none"],
                    ["total", "currency"],
                    ["shippingCost", "currency"],
                    ["taxCost", "currency"],
                    ["taxRate", "percentage"],
                    ["finalTotal", "currency"]
                ], c = 0, d = b.length; c < d; c++)
                for (var e = b[c][0] + "Outlets", g, n = 0, p = a[e].length; n < p; n++) {
                    switch (b[c][1]) {
                        case "none":
                            g = "" + a[b[c][0]];
                            break;
                        case "currency":
                            g = a.valueToCurrencyString(a[b[c][0]]);
                            break;
                        case "percentage":
                            g = a.valueToPercentageString(a[b[c][0]]);
                            break;
                        default:
                            g = "" + a[b[c][0]]
                    }
                    a[e][n].innerHTML = "" + g
                }
        };
        a.updateCartView = function() {
            var b = [],
                c, d, e, g, n, p;
            d = document.createElement("div");
            c = 0;
            for (var q = a.cartHeaders.length; c < q; c++) {
                e = document.createElement("div");
                p = a.cartHeaders[c].split("_");
                e.innerHTML = a.print(p[0]);
                e.className = "item" + p[0];
                for (var f = 1, r = p.length; f < r; f++) "noheader" == p[f].toLowerCase() && (e.style.display = "none");
                d.appendChild(e)
            }
            d.className = "cartHeaders";
            b[0] = d;
            var t = "",
                u = 0;
            a.each(function(c, f) {
                u += c.price * c.quantity;
                t += "- " + c.name + "- Size " + c.size + " ( " + number_format(c.price, 0, ".", ",") + " x " + c.quantity + " = " + number_format(c.price * c.quantity, 0, ".", ",") + " -IDR" + " )\n";
                d = document.createElement("div");
                for (var I = 0, J = a.cartHeaders.length; I < J; I++) e = document.createElement("div"), g = a.cartHeaders[I].split("_"),
                    n = a.createCartRow(g, c, n), e.innerHTML = n, e.className = "item" + g[0], d.appendChild(e);
                d.className = "itemContainer group";
                b[f + 1] = d
            });
        	tongship = u + a.phiShip;
 			t += "- Phí vận chuyển: " + number_format(a.phiShip, 0, ".", ",") + " -IDR" + "\n" + "- Total pembayaran: " + number_format(tongship, 0, ".", ",") + " -IDR";
            try {
                a.entry = "layidthongtinsanpham", document.getElementById(a.entry).innerHTML = t
            } catch (K) {}
            c = 0;
            for (p = a.cartDivs.length; c < p; c++)
                if (q = a.cartDivs[c], q.childNodes && q.appendChild) {
                    for (; q.childNodes[0];) q.removeChild(q.childNodes[0]);
                    f = 0;
                    for (r = b.length; f < r; f++) q.appendChild(b[f])
                }
        };
        a.createCartRow = function(b, c, d) {
            switch (b[0].toLowerCase()) {
                case "total":
                    d =
                        a.valueToCurrencyString(parseFloat(c.price) * parseInt(c.quantity, 10));
                    break;
                case "increment":
                    d = a.valueToLink("+", "javascript:;", "onclick=\"simpleCart.items['" + c.id + "'].increment();\"");
                    break;
                case "decrement":
                    d = a.valueToLink("-", "javascript:;", "onclick=\"simpleCart.items['" + c.id + "'].decrement();\"");
                    break;
                case "remove":
                    d = a.valueToLink("<i class='fa fa-trash'/>", "javascript:;", "onclick=\"simpleCart.items['" + c.id + "'].remove();\"");
                    break;
                case "price":
                    d = a.valueToCurrencyString(c[b[0].toLowerCase()] ? c[b[0].toLowerCase()] : " ");
                    break;
                default:
                    d = c[b[0].toLowerCase()] ? c[b[0].toLowerCase()] : " "
            }
            for (var e = 1, g = b.length; e < g; e++) switch (option = b[e].toLowerCase(), option) {
                case "image":
                case "img":
                    d = a.valueToImageString(d);
                    break;
                case "input":
                    d = a.valueToTextInput(d, "onchange=\"simpleCart.items['" + c.id + "'].set('" + b[0].toLowerCase() + "' , this.value);\"");
                    break;
                case "div":
                case "span":
                case "h1":
                case "h2":
                case "h3":
                case "h4":
                case "p":
                    d = a.valueToElement(option, d, "");
                    break;
                case "noheader":
                    break;
                default:
                    error("unkown header option: " + option)
            }
            return d
        };
        a.addEventToArray = function(a, c, d) {
            for (var e, g = 0, n = a.length; g < n; g++) e = a[g], e.addEventListener ? e.addEventListener(d, c, !1) : e.attachEvent && e.attachEvent("on" + d, c)
        };
        a.createHiddenElement = function(a, c) {
            var d = document.createElement("input");
            d.type = "hidden";
            d.name = a;
            d.value = c;
            return d
        };
        a.currencySymbol = function() {
            switch (a.currency) {
                case CHF:
                    return "CHF&nbsp;";
                case CZK:
                    return "CZK&nbsp;";
                case DKK:
                    return "DKK&nbsp;";
                case HUF:
                    return "HUF&nbsp;";
                case NOK:
                    return "NOK&nbsp;";
                case PLN:
                    return "PLN&nbsp;";
                case SEK:
                    return "SEK&nbsp;";
                case JPY:
                    return "&yen;";
                case EUR:
                    return "&euro;";
                case GBP:
                    return "&pound;";
                case CHF:
                    return "CHF&nbsp;";
                case THB:
                    return "&#3647;";
                case USD:
                case IDR:
                    return "-IDR";
                case CAD:
                case AUD:
                case NZD:
                case HKD:
                case SGD:
                    return "&#36;";
                default:
                    return ""
            }
        };
        a.currencyStringForPaypalCheckout = function(b) {
            return "&#36;" == a.currencySymbol() ? "$" + parseFloat(b).toFixed(2) : "" + parseFloat(b).toFixed(2)
        };
        a.valueToCurrencyString = function(b) {
            b = parseFloat(b);
            isNaN(b) && (b = 0);
            return b.toCurrency(a.currencySymbol())
        };
        a.valueToPercentageString =
            function(a) {
                return parseFloat(100 * a) + "%"
            };
        a.valueToImageString = function(a) {
            return a.match(/<\s*img.*src\=/) ? a : '<img src="' + a + '" />'
        };
        a.valueToTextInput = function(a, c) {
            return '<input type="text" value="' + a + '" ' + c + " />"
        };
        a.valueToLink = function(a, c, d) {
            return '<a href="' + c + '" ' + d + " >" + a + "</a>"
        };
        a.valueToElement = function(a, c, d) {
            return "<" + a + " " + d + " > " + c + "</" + a + ">"
        };
        a.hasItem = function(b) {
            var c, d = !1;
            a.each(function(e) {
                c = !0;
                a.each(b, function(a, d, p) {
                    "quantity" !== p && "id" !== p && b[p] !== e[p] && (c = !1)
                });
                c && (d = e)
            });
            return d
        };
        a.ln = {
            en_us: {
                quantity: "Quantity",
                price: "Price",
                total: "Total",
                decrement: "Decrement",
                increment: "Increment",
                remove: "Remove",
                tax: "Tax",
                shipping: "Shipping",
                image: "Image"
            }
        };
        a.language = "en_us";
        a.print = function(a) {
            return this.ln[this.language] && this.ln[this.language][a.toLowerCase()] ? this.ln[this.language][a.toLowerCase()] : a
        };
        a.update = function() {
            simpleCart.isLoaded || simpleCart.load();
            simpleCart.pageIsReady || simpleCart.initializeView();
            a.updateTotals();
            a.updateView();
            a.save()
        };
        a.updateTotals = function() {
            a.total =
                0;
            a.quantity = 0;
            a.each(function(b) {
                1 > b.quantity ? b.remove() : null !== b.quantity && "undefined" !== b.quantity && (a.quantity = parseInt(a.quantity, 10) + parseInt(b.quantity, 10));
                b.price && (a.total = parseFloat(a.total) + parseInt(b.quantity, 10) * parseFloat(b.price))
            });
            a.shippingCost = a.shipping();
            a.taxCost = parseFloat(a.total) * a.taxRate;
            a.finalTotal = a.shippingCost + a.taxCost + a.total + a.phiShip
        };
        a.shipping = function() {
            if (0 === parseInt(a.quantity, 10)) return 0;
            var b = parseFloat(a.shippingFlatRate) + parseFloat(a.shippingTotalRate) * parseFloat(a.total) +
                parseFloat(a.shippingQuantityRate) * parseInt(a.quantity, 10);
            a.each(function(a) {
                a.shipping && (b = "function" == typeof a.shipping ? b + parseFloat(a.shipping()) : b + parseFloat(a.shipping))
            });
            return b
        };
        a.initialize = function() {
            simpleCart.initializeView();
            simpleCart.load();
            simpleCart.update()
        }
    }

    function CartItem() {
        for (; simpleCart.items["c" + simpleCart.nextId];) simpleCart.nextId++;
        this.id = "c" + simpleCart.nextId
    }

    function Shelf() {
        this.items = {}
    }

    function ShelfItem() {
        this.id = "s" + simpleCart.nextId++
    }

    function createCookie(a, b, c) {
        if (c) {
            var d = new Date;
            d.setTime(d.getTime() + 864E5 * c);
            c = "; expires=" + d.toGMTString()
        } else c = "";
        b = b.replace(/\=/g, "~");
        document.cookie = a + "=" + escape(b) + c + "; path=/"
    }

    function readCookie(a) {
        a += "=";
        for (var b = document.cookie.split(";"), c = 0; c < b.length; c++) {
            for (var d = b[c];
                " " == d.charAt(0);) d = d.substring(1, d.length);
            if (0 === d.indexOf(a)) return unescape(d.substring(a.length, d.length)).replace(/\~/g, "=")
        }
        return null
    }

    function eraseCookie(a) {
        createCookie(a, "", -1)
    }

    function number_format(a, b, c, d) {
        var e = isNaN(b = Math.abs(b)) ? 2 : b;
        b = void 0 == c ? "," : c;
        d = void 0 == d ? "." : d;
        c = 0 > a ? "-" : "";
        var g = parseInt(a = Math.abs(+a || 0).toFixed(e)) + "",
            n = 3 < (n = g.length) ? n % 3 : 0;
        return c + (n ? g.substr(0, n) + d : "") + g.substr(n).replace(/(\d{3})(?=\d)/g, "$1" + d) + (e ? b + Math.abs(a - g).toFixed(e).slice(2) : "")
    }

    function error(a) {
        try {
            console.log(a)
        } catch (b) {}
    }
    imgr = [];
    showRandomImg = !0;
    labelnumposts = 101;
    labelnumposts1 = 12;
    showPostDate = !0;
    var thumbnail_mode = "no-float";
    summary_img = summary_noimg = 0;
    relatednumposts = 20;
    newimgwidth = 29;
    newimgheight = 19;
    sumtitle = 35;
    labelsumtitle = 64;
    var Custom = "Custom",
        GoogleCheckout = "GoogleCheckout",
        PayPal = "PayPal",
        Email = "Email",
        AustralianDollar = "AUD",
        AUD = "AUD",
        CanadianDollar = "CAD",
        CAD = "CAD",
        CzechKoruna = "CZK",
        CZK = "CZK",
        DanishKrone = "DKK",
        DKK = "DKK",
        Euro = "EUR",
        EUR = "EUR",
        HongKongDollar = "HKD",
        HKD = "HKD",
        HungarianForint = "HUF",
        HUF = "HUF",
        IsraeliNewSheqel = "ILS",
        ILS = "ILS",
        JapaneseYen = "JPY",
        JPY = "JPY",
        MexicanPeso = "MXN",
        MXN = "MXN",
        NorwegianKrone = "NOK",
        NOK = "NOK",
        NewZealandDollar = "NZD",
        NZD = "NZD",
        PolishZloty = "PLN",
        PLN = "PLN",
        PoundSterling = "GBP",
        GBP = "GBP",
        SingaporeDollar =
        "SGD",
        SGD = "SGD",
        SwedishKrona = "SEK",
        SEK = "SEK",
        SwissFranc = "CHF",
        CHF = "CHF",
        ThaiBaht = "THB",
        THB = "THB",
        USDollar = "USD",
        USD = "USD",
        IDR = "IDR",
        CryptoJS = CryptoJS || function(a, b) {
            var c = {},
                d = c.lib = {},
                e = function() {},
                g = d.Base = {
                    extend: function(a) {
                        e.prototype = this;
                        var d = new e;
                        a && d.mixIn(a);
                        d.hasOwnProperty("init") || (d.init = function() {
                            d.$super.init.apply(this, arguments)
                        });
                        d.init.prototype = d;
                        d.$super = this;
                        return d
                    },
                    create: function() {
                        var a = this.extend();
                        a.init.apply(a, arguments);
                        return a
                    },
                    init: function() {},
                    mixIn: function(a) {
                        for (var d in a) a.hasOwnProperty(d) &&
                            (this[d] = a[d]);
                        a.hasOwnProperty("toString") && (this.toString = a.toString)
                    },
                    clone: function() {
                        return this.init.prototype.extend(this)
                    }
                },
                n = d.WordArray = g.extend({
                    init: function(a, d) {
                        a = this.words = a || [];
                        this.sigBytes = d != b ? d : 4 * a.length
                    },
                    toString: function(a) {
                        return (a || q).stringify(this)
                    },
                    concat: function(a) {
                        var d = this.words,
                            b = a.words,
                            c = this.sigBytes;
                        a = a.sigBytes;
                        this.clamp();
                        if (c % 4)
                            for (var e = 0; e < a; e++) d[c + e >>> 2] |= (b[e >>> 2] >>> 24 - e % 4 * 8 & 255) << 24 - (c + e) % 4 * 8;
                        else if (65535 < b.length)
                            for (e = 0; e < a; e += 4) d[c + e >>> 2] = b[e >>>
                                2];
                        else d.push.apply(d, b);
                        this.sigBytes += a;
                        return this
                    },
                    clamp: function() {
                        var d = this.words,
                            b = this.sigBytes;
                        d[b >>> 2] &= 4294967295 << 32 - b % 4 * 8;
                        d.length = a.ceil(b / 4)
                    },
                    clone: function() {
                        var a = g.clone.call(this);
                        a.words = this.words.slice(0);
                        return a
                    },
                    random: function(d) {
                        for (var b = [], c = 0; c < d; c += 4) b.push(4294967296 * a.random() | 0);
                        return new n.init(b, d)
                    }
                }),
                p = c.enc = {},
                q = p.Hex = {
                    stringify: function(a) {
                        var d = a.words;
                        a = a.sigBytes;
                        for (var b = [], c = 0; c < a; c++) {
                            var e = d[c >>> 2] >>> 24 - c % 4 * 8 & 255;
                            b.push((e >>> 4).toString(16));
                            b.push((e &
                                15).toString(16))
                        }
                        return b.join("")
                    },
                    parse: function(a) {
                        for (var d = a.length, b = [], c = 0; c < d; c += 2) b[c >>> 3] |= parseInt(a.substr(c, 2), 16) << 24 - c % 8 * 4;
                        return new n.init(b, d / 2)
                    }
                },
                f = p.Latin1 = {
                    stringify: function(a) {
                        var d = a.words;
                        a = a.sigBytes;
                        for (var b = [], c = 0; c < a; c++) b.push(String.fromCharCode(d[c >>> 2] >>> 24 - c % 4 * 8 & 255));
                        return b.join("")
                    },
                    parse: function(a) {
                        for (var d = a.length, b = [], c = 0; c < d; c++) b[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - c % 4 * 8;
                        return new n.init(b, d)
                    }
                },
                r = p.Utf8 = {
                    stringify: function(a) {
                        try {
                            return decodeURIComponent(escape(f.stringify(a)))
                        } catch (d) {
                            throw Error("Malformed UTF-8 data");
                        }
                    },
                    parse: function(a) {
                        return f.parse(unescape(encodeURIComponent(a)))
                    }
                },
                t = d.BufferedBlockAlgorithm = g.extend({
                    reset: function() {
                        this._data = new n.init;
                        this._nDataBytes = 0
                    },
                    _append: function(a) {
                        "string" == typeof a && (a = r.parse(a));
                        this._data.concat(a);
                        this._nDataBytes += a.sigBytes
                    },
                    _process: function(d) {
                        var b = this._data,
                            c = b.words,
                            e = b.sigBytes,
                            f = this.blockSize,
                            g = e / (4 * f),
                            g = d ? a.ceil(g) : a.max((g | 0) - this._minBufferSize, 0);
                        d = g * f;
                        e = a.min(4 * d, e);
                        if (d) {
                            for (var t = 0; t < d; t += f) this._doProcessBlock(c, t);
                            t = c.splice(0, d);
                            b.sigBytes -=
                                e
                        }
                        return new n.init(t, e)
                    },
                    clone: function() {
                        var a = g.clone.call(this);
                        a._data = this._data.clone();
                        return a
                    },
                    _minBufferSize: 0
                });
            d.Hasher = t.extend({
                cfg: g.extend(),
                init: function(a) {
                    this.cfg = this.cfg.extend(a);
                    this.reset()
                },
                reset: function() {
                    t.reset.call(this);
                    this._doReset()
                },
                update: function(a) {
                    this._append(a);
                    this._process();
                    return this
                },
                finalize: function(a) {
                    a && this._append(a);
                    return this._doFinalize()
                },
                blockSize: 16,
                _createHelper: function(a) {
                    return function(d, b) {
                        return (new a.init(b)).finalize(d)
                    }
                },
                _createHmacHelper: function(a) {
                    return function(d,
                        b) {
                        return (new u.HMAC.init(a, b)).finalize(d)
                    }
                }
            });
            var u = c.algo = {};
            return c
        }(Math);
    (function(a) {
        function b(a, d, b, c, e, f, g) {
            a = a + (d & b | ~d & c) + e + g;
            return (a << f | a >>> 32 - f) + d
        }

        function c(a, d, b, c, e, f, g) {
            a = a + (d & c | b & ~c) + e + g;
            return (a << f | a >>> 32 - f) + d
        }

        function d(a, d, b, c, e, f, g) {
            a = a + (d ^ b ^ c) + e + g;
            return (a << f | a >>> 32 - f) + d
        }

        function e(a, d, b, c, e, f, g) {
            a = a + (b ^ (d | ~c)) + e + g;
            return (a << f | a >>> 32 - f) + d
        }
        for (var g = CryptoJS, n = g.lib, p = n.WordArray, q = n.Hasher, n = g.algo, f = [], r = 0; 64 > r; r++) f[r] = 4294967296 * a.abs(a.sin(r + 1)) | 0;
        n = n.MD5 = q.extend({
            _doReset: function() {
                this._hash = new p.init([1732584193, 4023233417, 2562383102, 271733878])
            },
            _doProcessBlock: function(a, g) {
                for (var n = 0; 16 > n; n++) {
                    var p = g + n,
                        q = a[p];
                    a[p] = (q << 8 | q >>> 24) & 16711935 | (q << 24 | q >>> 8) & 4278255360
                }
                var n = this._hash.words,
                    p = a[g + 0],
                    q = a[g + 1],
                    r = a[g + 2],
                    v = a[g + 3],
                    w = a[g + 4],
                    x = a[g + 5],
                    y = a[g + 6],
                    z = a[g + 7],
                    A = a[g + 8],
                    B = a[g + 9],
                    C = a[g + 10],
                    D = a[g + 11],
                    E = a[g + 12],
                    F = a[g + 13],
                    G = a[g + 14],
                    H = a[g + 15],
                    h = n[0],
                    k = n[1],
                    l = n[2],
                    m = n[3],
                    h = b(h, k, l, m, p, 7, f[0]),
                    m = b(m, h, k, l, q, 12, f[1]),
                    l = b(l, m, h, k, r, 17, f[2]),
                    k = b(k, l, m, h, v, 22, f[3]),
                    h = b(h, k, l, m, w, 7, f[4]),
                    m = b(m, h, k, l, x, 12, f[5]),
                    l = b(l, m, h, k, y, 17, f[6]),
                    k = b(k, l, m, h, z, 22, f[7]),
                    h = b(h, k, l, m, A, 7, f[8]),
                    m = b(m, h, k, l, B, 12, f[9]),
                    l = b(l, m, h, k, C, 17, f[10]),
                    k = b(k, l, m, h, D, 22, f[11]),
                    h = b(h, k, l, m, E, 7, f[12]),
                    m = b(m, h, k, l, F, 12, f[13]),
                    l = b(l, m, h, k, G, 17, f[14]),
                    k = b(k, l, m, h, H, 22, f[15]),
                    h = c(h, k, l, m, q, 5, f[16]),
                    m = c(m, h, k, l, y, 9, f[17]),
                    l = c(l, m, h, k, D, 14, f[18]),
                    k = c(k, l, m, h, p, 20, f[19]),
                    h = c(h, k, l, m, x, 5, f[20]),
                    m = c(m, h, k, l, C, 9, f[21]),
                    l = c(l, m, h, k, H, 14, f[22]),
                    k = c(k, l, m, h, w, 20, f[23]),
                    h = c(h, k, l, m, B, 5, f[24]),
                    m = c(m, h, k, l, G, 9, f[25]),
                    l = c(l, m, h, k, v, 14, f[26]),
                    k = c(k, l, m, h, A, 20, f[27]),
                    h = c(h, k, l, m, F, 5, f[28]),
                    m = c(m, h,
                        k, l, r, 9, f[29]),
                    l = c(l, m, h, k, z, 14, f[30]),
                    k = c(k, l, m, h, E, 20, f[31]),
                    h = d(h, k, l, m, x, 4, f[32]),
                    m = d(m, h, k, l, A, 11, f[33]),
                    l = d(l, m, h, k, D, 16, f[34]),
                    k = d(k, l, m, h, G, 23, f[35]),
                    h = d(h, k, l, m, q, 4, f[36]),
                    m = d(m, h, k, l, w, 11, f[37]),
                    l = d(l, m, h, k, z, 16, f[38]),
                    k = d(k, l, m, h, C, 23, f[39]),
                    h = d(h, k, l, m, F, 4, f[40]),
                    m = d(m, h, k, l, p, 11, f[41]),
                    l = d(l, m, h, k, v, 16, f[42]),
                    k = d(k, l, m, h, y, 23, f[43]),
                    h = d(h, k, l, m, B, 4, f[44]),
                    m = d(m, h, k, l, E, 11, f[45]),
                    l = d(l, m, h, k, H, 16, f[46]),
                    k = d(k, l, m, h, r, 23, f[47]),
                    h = e(h, k, l, m, p, 6, f[48]),
                    m = e(m, h, k, l, z, 10, f[49]),
                    l = e(l, m, h, k,
                        G, 15, f[50]),
                    k = e(k, l, m, h, x, 21, f[51]),
                    h = e(h, k, l, m, E, 6, f[52]),
                    m = e(m, h, k, l, v, 10, f[53]),
                    l = e(l, m, h, k, C, 15, f[54]),
                    k = e(k, l, m, h, q, 21, f[55]),
                    h = e(h, k, l, m, A, 6, f[56]),
                    m = e(m, h, k, l, H, 10, f[57]),
                    l = e(l, m, h, k, y, 15, f[58]),
                    k = e(k, l, m, h, F, 21, f[59]),
                    h = e(h, k, l, m, w, 6, f[60]),
                    m = e(m, h, k, l, D, 10, f[61]),
                    l = e(l, m, h, k, r, 15, f[62]),
                    k = e(k, l, m, h, B, 21, f[63]);
                n[0] = n[0] + h | 0;
                n[1] = n[1] + k | 0;
                n[2] = n[2] + l | 0;
                n[3] = n[3] + m | 0
            },
            _doFinalize: function() {
                var d = this._data,
                    b = d.words,
                    c = 8 * this._nDataBytes,
                    e = 8 * d.sigBytes;
                b[e >>> 5] |= 128 << 24 - e % 32;
                var g = a.floor(c /
                    4294967296);
                b[(e + 64 >>> 9 << 4) + 15] = (g << 8 | g >>> 24) & 16711935 | (g << 24 | g >>> 8) & 4278255360;
                b[(e + 64 >>> 9 << 4) + 14] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360;
                d.sigBytes = 4 * (b.length + 1);
                this._process();
                d = this._hash;
                b = d.words;
                for (c = 0; 4 > c; c++) e = b[c], b[c] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;
                return d
            },
            clone: function() {
                var a = q.clone.call(this);
                a._hash = this._hash.clone();
                return a
            }
        });
        g.MD5 = q._createHelper(n);
        g.HmacMD5 = q._createHmacHelper(n)
    })(Math);
    CartItem.prototype.set = function(a, b) {
        a = a.toLowerCase();
        "function" !== typeof this[a] && "id" !== a ? ("quantity" == a ? (b = b.replace(/[^(\d|\.)]*/gi, ""), b = b.replace(/,*/gi, ""), b = parseInt(b, 10)) : "price" == a && (b = b.replace(/[^(\d|\.)]*/gi, ""), b = b.replace(/,*/gi, ""), b = parseFloat(b)), "number" == typeof b && isNaN(b) ? error("Improperly formatted input.") : (b.match(/\~|\=/) && error("Special character ~ or = not allowed: " + b), b = b.replace(/\~|\=/g, ""), this[a] = b, this.checkQuantityAndPrice())) : error("Cannot change " + a + ", this is a reserved field.");
        simpleCart.update()
    };
    CartItem.prototype.increment = function() {
        this.quantity = parseInt(this.quantity, 10) + 1;
        simpleCart.update()
    };
    CartItem.prototype.decrement = function() {
        2 > parseInt(this.quantity, 10) ? this.remove() : (this.quantity = parseInt(this.quantity, 10) - 1, simpleCart.update())
    };
    CartItem.prototype.print = function() {
        var a = "";
        simpleCart.each(this, function(b, c, d) {
            a += escape(d) + "=" + escape(b) + "||"
        });
        return a.substring(0, a.length - 2)
    };
    CartItem.prototype.checkQuantityAndPrice = function() {
        this.quantity && null != this.quantity && "undefined" != this.quantity ? (this.quantity = ("" + this.quantity).replace(/,*/gi, ""), this.quantity = parseInt(("" + this.quantity).replace(/[^(\d|\.)]*/gi, ""), 10), isNaN(this.quantity) && (error("Quantity is not a number."), this.quantity = 1)) : (this.quantity = 1, error("No quantity for item."));
        this.price && null != this.price && "undefined" != this.price ? (this.price = ("" + this.price).replace(/,*/gi, ""), this.price = parseFloat(("" + this.price).replace(/[^(\d|\.)]*/gi,
            "")), isNaN(this.price) && (error("Price is not a number."), this.price = 0)) : (this.price = 0, error("No price for item or price not properly formatted."))
    };
    CartItem.prototype.parseValuesFromArray = function(a) {
        if (a && a.length && 0 < a.length) {
            for (var b = 0, c = a.length; b < c; b++) {
                a[b] = a[b].replace(/\|\|/g, "| |");
                a[b] = a[b].replace(/\+\+/g, "+ +");
                a[b].match(/\~/) && error("Special character ~ not allowed: " + a[b]);
                a[b] = a[b].replace(/\~/g, "");
                var d = a[b].split("=");
                if (1 < d.length) {
                    if (2 < d.length)
                        for (var e = 2, g = d.length; e < g; e++) d[1] = d[1] + "=" + d[e];
                    this[unescape(d[0]).toLowerCase()] = unescape(d[1])
                }
            }
            return !0
        }
        return !1
    };
    CartItem.prototype.remove = function() {
        simpleCart.remove(this.id);
        simpleCart.update()
    };
    Shelf.prototype.readPage = function() {
        this.items = {};
        var a = getElementsByClassName("simpleCart_shelfItem"),
            b;
        me = this;
        for (var c = 0, d = a.length; c < d; c++) b = new ShelfItem, me.checkChildren(a[c], b), me.items[b.id] = b
    };
    Shelf.prototype.checkChildren = function(a, b) {
        if (a.childNodes)
            for (var c = 0; a.childNodes[c]; c++) {
                var d = a.childNodes[c];
                if (d.className && d.className.match(/item_[^ ]+/)) {
                    var e = /item_[^ ]+/.exec(d.className)[0].split("_");
                    if ("add" == e[1] || "Add" == e[1]) {
                        e = [];
                        e.push(d);
                        var g = simpleCart.Shelf.addToCart(b.id);
                        simpleCart.addEventToArray(e, g, "click");
                        d.id = b.id
                    } else b[e[1]] = d
                }
                d.childNodes[0] && this.checkChildren(d, b)
            }
    };
    Shelf.prototype.empty = function() {
        this.items = {}
    };
    Shelf.prototype.addToCart = function(a) {
        return function() {
            simpleCart.Shelf.items[a] ? simpleCart.Shelf.items[a].addToCart() : error("Shelf item with id of " + a + " does not exist.")
        }
    };
    ShelfItem.prototype.remove = function() {
        simpleCart.Shelf.items[this.id] = null
    };
    ShelfItem.prototype.addToCart = function() {
        var a = [],
            b, c;
        for (c in this)
            if ("function" !== typeof this[c] && "id" !== c) {
                b = "";
                switch (c) {
                    case "price":
                        this[c].value ? b = this[c].value : this[c].innerHTML && (b = this[c].innerHTML);
                        b = b.replace(/[^(\d|\.)]*/gi, "");
                        b = b.replace(/,*/, "");
                        break;
                    case "image":
                        b = this[c].src;
                        break;
                    default:
                        b = this[c].value ? this[c].value : this[c].innerHTML ? this[c].innerHTML : this[c].src ? this[c].src : this[c]
                }
                a.push(c + "=" + b)
            }
        simpleCart.add(a)
    };
    var getElementsByClassName = function(a, b, c) {
        getElementsByClassName = document.getElementsByClassName ? function(a, b, c) {
            c = c || document;
            a = c.getElementsByClassName(a);
            b = b ? new RegExp("\\b" + b + "\\b", "i") : null;
            c = [];
            for (var n, p = 0, q = a.length; p < q; p += 1) n = a[p], b && !b.test(n.nodeName) || c.push(n);
            return c
        } : document.evaluate ? function(a, b, c) {
            b = b || "*";
            c = c || document;
            var n = a.split(" "),
                p = "",
                q = "http://www.w3.org/1999/xhtml" === document.documentElement.namespaceURI ? "http://www.w3.org/1999/xhtml" : null;
            a = [];
            for (var f, r = 0, t = n.length; r <
                t; r += 1) p += "[contains(concat(' ', @class, ' '), ' " + n[r] + " ')]";
            try {
                f = document.evaluate(".//" + b + p, c, q, 0, null)
            } catch (u) {
                f = document.evaluate(".//" + b + p, c, null, 0, null)
            }
            for (; b = f.iterateNext();) a.push(b);
            return a
        } : function(a, b, c) {
            b = b || "*";
            c = c || document;
            var n = a.split(" ");
            a = [];
            b = "*" === b && c.all ? c.all : c.getElementsByTagName(b);
            c = [];
            var p;
            p = 0;
            for (var q = n.length; p < q; p += 1) a.push(new RegExp("(^|\\s)" + n[p] + "(\\s|$)"));
            for (var q = 0, f = b.length; q < f; q += 1) {
                n = b[q];
                p = !1;
                for (var r = 0, t = a.length; r < t && (p = a[r].test(n.className),
                        p); r += 1);
                p && c.push(n)
            }
            return c
        };
        return getElementsByClassName(a, b, c)
    };
    String.prototype.reverse = function() {
        return this.split("").reverse().join("")
    };
    Number.prototype.withCommas = function() {
        for (var a = 3, b = parseFloat(this).toFixed(0).toString().reverse(); a < b.length;) b = b.substring(0, a) + "," + b.substring(a), a += 4;
        return b.reverse()
    };
    Number.prototype.toCurrency = function(a) {
        return this.withCommas() + (a ? a : "$")
    };
    var simpleCart = new Cart;
    "undefined" !== typeof jQuery ? $(document).ready(function() {
        simpleCart.initialize()
    }) : "undefined" !== typeof Prototype && Event.observe(window, "load", function() {
        simpleCart.initialize()
    });

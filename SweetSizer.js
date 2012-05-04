var _ = require('underscore'),
	fs = require('fs'),
	path = require('path'),
	im = require('imagemagick'),
	request = require('request')

var defaults = {
	verbose: false, // ALL of the debugs

	dir: __dirname, // path to the folder to get images from

	cacheDir: function (url, opts) {
		return opts.dir
	},

	params: function (url, opts) {
		var split = url.replace("/", "").split("/")
		var width

		if (split.length < 2) {
			width = 0
		}
		else {
			width = split[split.length - 1]
		}
		
		split.pop() // remove width
		return {
			fileUrl: split.join("/"),
			width: parseInt(width)
		}
	},

	configureParams: function (params) {
		return params
	},

	cacheName: function (data, url, opts) {
		return data.width + "-" + data.fileUrl.replace(/[\/\: ]/g, "-")
	},

	resolveToLocal: function (data, url, opts) {
		return path.join(opts.dir, data.fileUrl)
	},

	log: function (status, data) {
		console.log("SweetSizer - " + status + " " + data.fileUrl + " " + data.width)
	},

	allowLocal: true,

	allowRemote: false
}

function isRemote (uri) {
	return (uri.indexOf("http") === 0)
}

function isHttps (url) {
	return (uri.indexOf("https") === 0)
}

module.exports = function (opts) {
	opts = _.extend({}, defaults, opts)

	return function (req, res, next) {

		var file = req.url.replace("/", "") // it will have a leading / which is bad for remote files
		if (!(opts.allowLocal || opts.allowRemote)) return next() // they have to choose one or the other
		var params = opts.params(req.url, opts)
		var cacheDir = typeof opts.cacheDir === "string" ? opts.cacheDir : opts.cacheDir(req.url, opts)
		if (!params.width) return next()

		params.dstPath = path.join(cacheDir, opts.cacheName(params, req.url, opts))

		setSrcDataOrPath(params.fileUrl, opts, params, function (err, params) {
			if (err) return res.send(err, 500)

			params = opts.configureParams(params)

			path.exists(params.dstPath, function (exists) {
				if (exists) {
					opts.log("cache", params)
					res.sendfile(params.dstPath)
					return
				}
				
				opts.log("convert", params)
				im.resize(params, function (err, stdout, stderr) {
					if (err) return next(err)
					res.sendfile(params.dstPath)
				})
			})
		})
	}
}

function setSrcDataOrPath (file, opts, params, cb) {
	if (isRemote(file)) {
		request.get({url: file, encoding: null}, function (err, res, body) {
			params.srcData = body
			cb(null, params)
		})
	}
	else {
		params.srcPath = opts.resolveToLocal(params, file, opts)
		cb(null, params)
	}
}

/*
#food
#psy

*/

var numCols = 0;
var numRows = 0;
var maxNumCols = 13;
var maxNumRows = 3;
var vidWidth = 600;
var vidHeight = 400;

var focusRow = 0;
var focusCol = 0;

// Update a particular HTML element with a new value
function updateHTML(elmId, value) {
	document.getElementById(elmId).innerHTML = value;
}

// This function is called when an error is thrown by the player
function onPlayerError(errorCode) {
	alert("An error occured of type:" + errorCode);
}

// This function is called when the player changes state
function onPlayerStateChange(newState) {
	updateHTML("playerState", newState);
}

// This function is called when the player changes state
function onPlayerStateChange2(newState) {
	updateHTML("playerState2", newState);
}

// Display information about the current state of the player
function updatePlayerInfo() {
	// Also check that at least one function exists since when IE unloads the
	// page, it will destroy the SWF before clearing the interval.
	if(ytplayer && ytplayer.getDuration) {
		updateHTML("videoDuration", ytplayer.getDuration());
		updateHTML("videoCurrentTime", ytplayer.getCurrentTime());
		updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
		updateHTML("startBytes", ytplayer.getVideoStartBytes());
		updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
	}
}

// Display information about the current state of the player
function updatePlayerInfo2() {
	if(ytplayer2 && ytplayer2.getDuration) {
		updateHTML("videoDuration2", ytplayer2.getDuration());
		updateHTML("videoCurrentTime2", ytplayer2.getCurrentTime());
		updateHTML("bytesTotal2", ytplayer2.getVideoBytesTotal());
		updateHTML("startBytes2", ytplayer2.getVideoStartBytes());
		updateHTML("bytesLoaded2", ytplayer2.getVideoBytesLoaded());
	}
}

// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
    var player = document.getElementById(playerId);
    $(player).width(vidWidth-5);
    $(player).height(vidHeight-5);
    player.playVideo();
    if (playerId.split(-2, -1) === focusRow && playerId.split(0, -1) === focusCol) {
        player.unMute();
    } else {
        player.mute();
    }
}

function loadFromQuery (query) {
    var URIQuery = encodeURIComponent(query);

    var url = 'https://gdata.youtube.com/feeds/api/videos?' +
        'q=' + URIQuery +
        '&max-results=' + (numRows * numCols) +
        '&orderby=relevance' +//viewcount
        '&alt=json';
    $.getJSON(url, function(data) {
        var entries = data.feed.entry.slice(0, numRows * numCols);
        loadPlayers(entries);
    });
}

// The "main method" of this sample. Called when someone clicks "Run".
function loadPlayers(videoEntries) {
    var videoIds = videoEntries.slice(0).map(getVideoIdFromEntry);
    for (var i = 0; i < numRows; ++i) {
        for (var j = 0; j < numCols; ++j) {
            var vidnum = (i * (numRows + 1)) + j;
            loadPlayer(videoIds[vidnum], 'video'+i+j);
        }
    }
}

function getVideoIdFromEntry (entry) {
    return entry.id.$t.split('/').pop();
}

function loadPlayer (videoID, playerId) {
    var params = {
        allowScriptAccess: "always",
        quality: 'low',
        bgcolor: '#000'
    };
    var atts = {
        id: playerId
    };
    var url = "http://www.youtube.com/apiplayer?" +
        "video_id=" + videoID +
        "&enablejsapi=1" +
        "&version=3" +
        '&rel=0' +
        '&loop=1&playlist=' + videoID +
        "&playerapiid=" + playerId;
        //  +
        // "&controls=0" +
        // "autoplay=1" +
        // "&playerapiid=" + playerId;
    swfobject.embedSWF(url, playerId, "100", "100", "9", null, null, params, atts);
}

function setupDOM () {
    var $videoWall = $('.videoWall');
    for (var i = 0; i < numRows; ++i) {
        for (var j = 0; j < numCols; ++j) {
            $videoWall.append($('<div/>').attr('id', 'video'+i+j));
        }
    }
}

// Sets up the video wall DOM
function setupVideoWall () {
    var videoWallWidth = $(".videoWall").width();
    var videoWallHeight = $(".videoWall").height();

    var vidWallMinWidth = 400;
    var vidWallMinHeight = 250;

    numCols = Math.min(Math.floor(videoWallWidth / vidWallMinWidth), maxNumCols);
    numRows = Math.min(Math.floor(videoWallHeight / vidWallMinHeight), maxNumRows);

    console.log(numRows);
    vidWidth = videoWallWidth / numCols;
    vidHeight = videoWallHeight / numRows;
}

function rescaleVideos () {
    var videoWallWidth = $(".videoWall").width();
    var videoWallHeight = $(".videoWall").height();

    vidWidth = videoWallWidth / numCols;
    vidHeight = videoWallHeight / numRows;

    for (var i = 0; i < numRows; ++i) {
        for (var j = 0; j < numCols; ++j) {
            $('#video'+i+j).width(vidWidth);
            $('#video'+i+j).height(vidHeight);
        }
    }
}

function _run () {
    setupVideoWall();
    setupDOM();
    var query = window.location.hash;
    if (!query) {
        alert('Type #topic at end of url for search.');
        query = '#psy';
    }
    loadFromQuery(query.substring(1));

    $(window).resize(function(event) {
        rescaleVideos();
    });

    $('.videoWall').mousemove(function(data) {
        var col = Math.floor(data.clientX / vidWidth);
        var row = Math.floor(data.clientY / vidHeight);
        if (focusCol !== col || focusRow !== row) {
            focusCol = col;
            focusRow = row;

            // mute all
            var player;
            for (var i = 0; i < numRows; ++i) {
                for (var j = 0; j < numCols; ++j) {
                    player = document.getElementById('video' + i + j);
                    player.mute();
                }
            }

            // unmute one
            var col = Math.floor(data.clientX / vidWidth);
            var row = Math.floor(data.clientY / vidHeight);
            var player = document.getElementById('video' + row + col);
            player.unMute();
        }        
    });
}
google.load("swfobject", "2.2");
google.setOnLoadCallback(_run);
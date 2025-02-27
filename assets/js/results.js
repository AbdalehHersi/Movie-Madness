var apikey = "27e13cea";
var youtubeKey = "AIzaSyCaTvOE0rMtVOkH2w2yV5TTm6_CN3fGk8Y";
var videoIndex = 1; 

function init(){

    $("#mediaText").hide(); //  hide modal

    var urlString=window.location.href;
    var paramString = urlString.split('?')[1];
    var params_arr = paramString.split('&');
    let result = location.href.match("i=");
    if (result == null){    //  normal params
        par = params_arr[0].split('=');
    movieTitle=par[1];
    par = params_arr[1].split('=');
    year= par[1];
    par = params_arr[2].split('=');
    media =par[1];
    par = params_arr[3].split('=');
    imbdId = par[1];
    
    callOmbdAPI(movieTitle, year, media, imbdId);
    } else if (result[0] === "i="){     //  imbdID
        par = params_arr[0].split('=');
        imbdId = par[1];
        callOmbdAPIImbdID(imbdId);
        return init;
    }
    
    callYoutubeApi(movieTitle, year, media, imbdId);


}


function callOmbdAPI(movieTitle, year, media, imbdId){
    var OmbdURL = "https://www.omdbapi.com/?t=" + movieTitle + "&y=" + year + "&apikey=" + apikey;
    if (media){
        callOmbdAPIMediaValidation(movieTitle, year, media, OmbdURL);
    } else if(imbdId){
        callOmbdAPIImbdID(imbdId);
    } else {
    fetchApiFunc(OmbdURL);
  }
    }

function fetchApiFunc(OmbdURL){
    fetch(OmbdURL)
    .then(function(response){
      if (response.ok){
        response.json().then(function(data){
            if(data.Response==="True"){
                DisplayOmbdResult(data);
            }
            else DisplayNoResult();
        })
      } else DisplayNoResult();
    })
}
    

function callOmbdAPIMediaValidation(movieTitle, year, media, OmbdURL){      //      validation 

    if (media == "movie" || media == "series" || media == "episode"){
        callOmbdAPIMedia(movieTitle, year, media);
    } else if(media == "None"){
        fetchApiFunc(OmbdURL);
    }else {
        $("#mediaText").show();
        $( "#dialogMedia" ).dialog({
            width: 400,
        });
    return;
    }
}

function callOmbdAPIMedia(movieTitle, year, media){
    var OmbdURL = "https://www.omdbapi.com/?t=" + movieTitle + "&y=" + year + "&type=" + media + "&apikey=" + apikey;
    fetch(OmbdURL)
    .then(function(response){
      if (response.ok){
        response.json().then(function(data){
            if(data.Response==="True"){
                DisplayOmbdResult(data);
            }
            else DisplayNoResult();
        })
      } else DisplayNoResult();
    })
}

function callOmbdAPIImbdID(imbdId){
    var OmbdURL = "https://www.omdbapi.com/?i=" + imbdId + "&apikey=" + apikey;
    fetch(OmbdURL)
    .then(function(response){
      if (response.ok){
        response.json().then(function(data){
            if(data.Response==="True"){
                DisplayOmbdResult(data);
            }
            else DisplayNoResult();
        })
      } else DisplayNoResult();
    })
}
  
function DisplayNoResult(){
    $('#movietitle').text("Sorry, no result found");
    $('#plot-info').text("Please return to the main page");
    $('#movieimage').attr("src","");
    $('#IMDb-rating').text("N/A");
    $('#rottenT').text("N/A");
    $('#metacritic').text("N/A");
    $('#metascore').text("N/A");
}

function DisplayOmbdResult(OmbdData){


    $('#plot-info').text(OmbdData.Plot);
    $('#movietitle').text(OmbdData.Title);
    $('#movieimage').attr("src",OmbdData.Poster);
    $('#IMDb-rating').text(OmbdData.imdbRating);
    if (OmbdData.Metascore !==''){
        $('#metascore').text(OmbdData.Metascore);
    } else{
        $('#metascore').text("N/A");
    }

    for (i=0; i<OmbdData.Ratings.length; i++){  //  rotten tomatoes ratings
        if(OmbdData.Ratings[i].Source === "Rotten Tomatoes")  {
            $('#rottenT').text(OmbdData.Ratings[i].Value);
            if (parseInt(OmbdData.Ratings[i].Value) > 60){
                $('#rottenT').append(" 🍅");
            } else if (parseInt(OmbdData.Ratings[i].Value) < 60){
                $('#rottenT').append(" 🟢");
            } else {
                $("#rottenT").append(" 🚫");
            }
            break;
        } else   $('#rottenT').text("N/A")
    }
        
    for (i=0; i<OmbdData.Ratings.length; i++){
        if(OmbdData.Ratings[i].Source === "Metacritic")  {
            $('#metacritic').text(OmbdData.Ratings[i].Value);
            break;
        }
        else  $('#metacritic').text("N/A")
    }
   



}

function returnFunc(){
    location.assign("./index.html")
}
// second API call to youtube API
function callYoutubeApi(title, year, media, id) {

    var videoQueryUrl = 'https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=' + title + '+' + year+ '&key='+ youtubeKey;     

    fetch(videoQueryUrl)
  .then(function (response) {
    if (!response.ok) {
      throw response.json();
    }
    return response.json();
  })
  .then(function (videoData) {
    if(!videoData.items) {
        console.log('No results found!');   
    } else {
        // display the first video from the list of query result        
        videoID_1 = videoData.items[0].id.videoId;       

        for (i=1; i<6; i++) {
            localStorage.setItem(i, videoData.items[i-1].id.videoId);
        }
      
        videoPlayer(videoID_1);              
    }
  })
}

function videoPlayer(videoID_1) {

    var videoID = localStorage.getItem(videoIndex);
    var videoURL = 'https://www.youtube.com/embed/'+videoID;
    var playerEl = "<iframe title='YouTube video player' type=\"text/html\" width='640' height='360' src="+ videoURL + " frameborder='0' allowFullScreen></iframe>";            
    $("#player").html(playerEl);  
}
// switch to next youtube video
function switchNext() {
    if (videoIndex>0 && videoIndex <5) {
        videoIndex++;
        videoPlayer("videoID");
    } 
}
// switch to previous youtube video
function switchBack() {
    if (videoIndex>1 && videoIndex <6) {
        videoIndex--;
        videoPlayer("videoID");
    } 
}

init();
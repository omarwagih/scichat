 random_articles_str = [];
  var articles_json = '';
  firebase.database().ref('items/').once('value', function(snap){
    articles_json = JSON.stringify(snap.val());
    console.log(articles_json);

    var toType = function(obj) {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
    }

    //console.log(toType(articles_json));

    articles_arr = JSON.parse(articles_json);

    //console.log(toType(articles_arr));

    var arrayLength = articles_arr.length;
    // dbg: random indexes
    rand_indexes = new Array();
    var cnt = 0;
    while(cnt != 5){
      rand = Math.floor((Math.random() * arrayLength) + 1)
      if( $.inArray(rand_indexes, rand) == -1 ){
        rand_indexes.push(rand);
        cnt++;
      }
    }

    for (var r = 0; r < 5; r++) {
        i = rand_indexes[r];
        //var cur_doi = articles_arr[i].doi;
        var cur_title = articles_arr[i].title;
        var cur_pdf = articles_arr[i].pdf;

        random_articles_str.push("<h5><a href='"+cur_pdf+"'>"+cur_title+"</a></h5>");
        //if(cur_title.includes('the')){
          console.log(cur_pdf);
        //}

        // example doi: 10.7554/eLife.21843
        //var doi_num = cur_doi.split(".")[2];
        //console.log(doi_num);
        //cur_url = 'http://cdn.elifesciences.org/elife-articles/'+doi_num+'/figures-pdf/elife'+doi_num+'-figures.pdf';
        //console.log(cur_url);
        //"url": "http://cdn.elifesciences.org/elife-articles/21843/figures-pdf/elife21843-figures.pdf",

    }

    //$('#random_papers').html(random_articles_str.join('<br>'));

    //var tmp = document.getElementById("title").innerHTML = articles_obj.title;
    //console.log(articles_obj[0].title);
});

//document.getElementById("random_papers").innerHTML = ;

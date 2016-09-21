'use strict';

let Xray     = require('x-ray')
,   colors   = require('colors')
,   util     = require('util')
,   clitable = require('cli-table')

let x = new Xray();

x( 'http://www.google.co.uk/movies?near=g20+6ug&rl=1', {
  'cinemas': x('.theater', [
    {
      'title': '.name',
      'films': x( '.movie', [
        {
          'title': '.name',
          'info': '.info',
          'times': x( '.times', ['span@text'] )
        }
      ])
    }
  ])
} )(printListings);

let films = {};

function printListings( e, r ) {
  if ( e ) {
    console.log( e );
    return;
  }

  let cine_count = 0;
  r.cinemas.forEach( function( cinema ) {
    if ( cine_count > 2 ) {
      return;
    }
    // print the title of the cinema
    console.log( cinema.title.yellow.bold );

    cinema.films.forEach( function( film ) {
      films[film.title.trim()] = {};

      let film_id = Object.keys( films ).indexOf( film.title.trim() );

      console.log( ('[' + film_id + ']').grey + '\t' + film.title.white );

      let times = '\t';
      let time_count = 0;

      film.times.forEach( function( time ) {
        time = time.trim();

        if ( time == '' ) {
          return;
        }

        if ( time_count % 6 == '' && times.trim() !== '' ) {
          times += '\n\t';
        }

        if ( timeInPast( time ) ) {
          time = time.red.dim;
        } else {
          time = time.green;
        }


        times += time + '\t';

        time_count++;
      } );

      console.log( times + '\n' );

    } );

    cine_count++;
  } );

}

function timeInPast( time ) {
  var bits = time.split(':');
  var current = new Date();

  if ( bits[0] < current.getHours() ) {
    return true;
  }

  if ( bits[0] <= current.getHours() && bits[1] <= current.getMinutes() ) {
    return true;
  }

  return false;
}

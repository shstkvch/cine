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

function printListings( e, r ) {
  if ( e ) {
    console.log( e );
    return;
  }

  let cine_count = 0;
  r.cinemas.forEach( function( cinema ) {
    if ( cine_count > 10 ) {
      return;
    }
    // print the title of the cinema
    console.log( cinema.title.yellow.bold );

    cinema.films.forEach( function( film ) {

      if ( ! film.times.length ) {
        console.log( 'No showings' );
        return;
      }

      let info = film.info.split('-');

      let rating = info[1];

      if ( rating.indexOf('PG') == -1 && rating.indexOf('U') == -1 ) {
        return; // exclude non-PG films
      }

      console.log( film.title );

      let times = '';
      let time_count = 0;

      // go through every film time
      film.times.forEach( function( time ) {
        time = time.trim(); // trim it so we don't have any spaces

        if ( time == '' ) {
          return; // if it's not a time, ignore it
        }

        // ensure we have only 6 times per line, create a new line every 6 times
        if ( time_count % 6 == '' && times.trim() !== '' ) {
          times += '\n';
        }

        // if the film screening time is in the past, make it red. Otherwise
        // make it green.
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

// determine if a screening time is in the past
function timeInPast( time ) {
  var bits = time.split(':');
  var current = new Date();

  // if the hour is less than the current hour, it's in the past - so TRUE
  if ( bits[0] < current.getHours() ) {
    return true;
  }

  // if the hour is the same but the minute is less than the current minute,
  // it's in the past, so TRUE
  if ( bits[0] <= current.getHours() && bits[1] < current.getMinutes() ) {
    return true;
  }

  // this screening time is in the future
  return false;
}

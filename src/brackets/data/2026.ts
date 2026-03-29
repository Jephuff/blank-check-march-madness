import { Data } from 'brackets/types';

// polls https://www.blankcheckpod.com/march-madness
const data: Data<0> = {
  options: [
    {
      poll: 'https://poll.fm/16811913',
      options: [
        {
          winner: 'Martin Scorsese',
          poll: 'https://poll.fm/16780861',
          options: [
            {
              winner: 'Martin Scorsese',
              poll: 'https://poll.fm/16734155',
              options: [
                {
                  winner: 'Martin Scorsese',
                  poll: 'https://poll.fm/16667456',
                  options: ['Martin Scorsese', 'Dennis Dugan'],
                },
                {
                  winner: 'F. Gary Gray',
                  poll: 'https://poll.fm/16667603',
                  options: ['F. Gary Gray', 'Francois Truffaut'],
                },
              ],
            },
            {
              winner: 'Joe Johnston',
              poll: 'https://poll.fm/16734163',
              options: [
                {
                  winner: 'Joe Johnston',
                  poll: 'https://poll.fm/16667612',
                  options: ['Anthony Minghella', 'Joe Johnston'],
                },
                {
                  winner: 'Hal Ashby',
                  poll: 'https://poll.fm/16667622',
                  options: ['James Wan', 'Hal Ashby'],
                },
              ],
            },
          ],
        },
        {
          winner: 'Milos Forman',
          poll: 'https://poll.fm/16798216',
          options: [
            {
              winner: 'Penelope Spheeris',
              poll: 'https://poll.fm/16734181',
              options: [
                {
                  winner: 'Warren Beatty',
                  poll: 'https://poll.fm/16667626',
                  options: ['Warren Beatty', 'Andrei Tarkovsky'],
                },
                {
                  winner: 'Penelope Spheeris',
                  poll: 'https://poll.fm/16667639',
                  options: ['Penelope Spheeris', 'Dutch Verhoeven'],
                },
              ],
            },
            {
              winner: 'Milos Forman',
              poll: 'https://poll.fm/16734185',
              options: [
                {
                  winner: 'Milos Forman',
                  poll: 'https://poll.fm/16667660',
                  options: ['Milos Forman', 'Bill Duke'],
                },
                {
                  winner: 'Judd Apatow',
                  poll: 'https://poll.fm/16667677',
                  options: ['Mira Nair', 'Judd Apatow'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      options: [
        {
          winner: 'Wes Anderson',
          poll: 'https://poll.fm/16780869',
          options: [
            {
              winner: 'Wes Anderson',
              poll: 'https://poll.fm/16734190',
              options: [
                {
                  winner: 'Wes Anderson',
                  poll: 'https://poll.fm/16667680',
                  options: ['Wes Anderson', 'James Gray'],
                },
                {
                  winner: 'Steve McQueen',
                  poll: 'https://poll.fm/16667692',
                  options: ['Steve McQueen', 'Jacques Tati'],
                },
              ],
            },
            {
              winner: 'Preston Sturges',
              poll: 'https://poll.fm/16780840',
              options: [
                {
                  winner: 'Curtis Hanson',
                  poll: 'https://poll.fm/16667698',
                  options: ['Joe Wright', 'Curtis Hanson'],
                },
                {
                  winner: 'Preston Sturges',
                  poll: 'https://poll.fm/16667703',
                  options: ['Céline Sciamma', 'Preston Sturges'],
                },
              ],
            },
          ],
        },
        {
          poll: 'https://poll.fm/16798241',
          options: [
            {
              winner: 'Tony Scott',
              poll: 'https://poll.fm/16780845',
              options: [
                {
                  winner: 'Tony Scott',
                  poll: 'https://poll.fm/16667709',
                  options: ['Tony Scott', 'Jia Zhangke'],
                },
                {
                  winner: 'Karyn Kusama',
                  poll: 'https://poll.fm/16667724',
                  options: ['Mike Leigh', 'Karyn Kusama'],
                },
              ],
            },
            {
              winner: 'Chris Columbus',
              poll: 'https://poll.fm/16780856',
              options: [
                {
                  winner: 'Gus Van Sant',
                  poll: 'https://poll.fm/16667736',
                  options: ['Kelly Reichardt', 'Gus Van Sant'],
                },
                {
                  winner: 'Chris Columbus',
                  poll: 'https://poll.fm/16667741',
                  options: ['Oliver Stone', 'Chris Columbus'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default data;

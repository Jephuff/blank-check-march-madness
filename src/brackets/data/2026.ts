import { Data } from 'brackets/types';

// polls https://www.blankcheckpod.com/march-madness
const data: Data<0> = {
  options: [
    {
      options: [
        {
          options: [
            {
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
          options: [
            {
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
          options: [
            {
              options: [
                {
                  poll: 'https://poll.fm/16667680',
                  options: ['Wes Anderson', 'James Gray'],
                },
                {
                  poll: 'https://poll.fm/16667692',
                  options: ['Steve McQueen', 'Jacques Tati'],
                },
              ],
            },
            {
              options: [
                {
                  options: ['Joe Wright', 'Curtis Hanson'],
                },
                {
                  options: ['Céline Sciamma', 'Preston Sturges'],
                },
              ],
            },
          ],
        },
        {
          options: [
            {
              options: [
                {
                  options: ['Tony Scott', 'Jia Zhangke'],
                },
                {
                  options: ['Mike Leigh', 'Karyn Kusama'],
                },
              ],
            },
            {
              options: [
                {
                  options: ['Kelly Reichardt', 'Gus Van Sant'],
                },
                {
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

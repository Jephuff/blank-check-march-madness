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
                  poll: 'https://poll.fm/16667612',
                  options: ['Anthony Minghella', 'Joe Johnston'],
                },
                {
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
                  options: ['Warren Beatty', 'Andrei Tarkovsky'],
                },
                {
                  options: ['Penelope Spheeris', 'Dutch Verhoeven'],
                },
              ],
            },
            {
              options: [
                {
                  options: ['Milos Forman', 'Bill Duke'],
                },
                {
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
                  options: ['Wes Anderson', 'James Gray'],
                },
                {
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

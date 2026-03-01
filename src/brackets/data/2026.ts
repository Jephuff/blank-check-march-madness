import { Data } from 'brackets/types';

// polls https://www.blankcheckpod.com/march-madness
// 2026 - LOSERS ONLY bracket
const data: Data<0> = {
  options: [
    {
      options: [
        {
          options: [
            {
              options: [
                {
                  poll: 'https://poll.fm/16667456',
                  options: ['Martin Scorsese', 'Dennis Dugan'],
                },
                {
                  options: ['F. Gary Gray', 'Francois Truffaut'],
                },
              ],
            },
            {
              options: [
                {
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

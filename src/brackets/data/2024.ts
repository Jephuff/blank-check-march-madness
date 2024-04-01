import { Data } from 'brackets/types';

// polls https://www.blankcheckpod.com/march-madness
const data: Data<0> = {
  winner: 'David Lynch',
  options: [
    {
      winner: 'David Lynch',
      options: [
        {
          winner: 'Steven Soderbergh',
          options: [
            {
              winner: 'Steven Soderbergh',
              options: [
                {
                  winner: 'Steven Soderbergh',
                  options: ['Steven Soderbergh', 'Barry Levinson'],
                },
                {
                  winner: 'Isao Takahata',
                  options: ['James Gray', 'Isao Takahata'],
                },
              ],
            },
            {
              winner: 'Edgar Wright',
              options: [
                {
                  winner: 'Edgar Wright',
                  options: ['Edgar Wright', 'Leos Carax'],
                },
                {
                  winner: 'Nicole Holofcener',
                  options: ['James Wan', 'Nicole Holofcener'],
                },
              ],
            },
          ],
        },
        {
          winner: 'David Lynch',
          options: [
            {
              winner: 'David Lynch',
              options: [
                {
                  winner: 'David Lynch',
                  options: ['David Lynch', 'Bill Duke'],
                },
                {
                  winner: 'Harold Ramis',
                  options: ['Richard Kelly', 'Harold Ramis'],
                },
              ],
            },
            {
              winner: 'Denis Villeneuve',
              options: [
                {
                  winner: 'Denis Villeneuve',
                  options: ['Denis Villeneuve', 'Curtis Hanson'],
                },
                {
                  winner: 'Wes Craven',
                  options: ['Wes Craven', 'Jonathan Glazer'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      winner: 'Spike Lee',
      options: [
        {
          winner: 'Ridley Scott',
          options: [
            {
              winner: 'Ridley Scott',
              options: [
                {
                  winner: 'Ridley Scott',
                  options: ['Ridley Scott', 'Alan Pakula'],
                },
                {
                  winner: 'Andrew Stanton',
                  options: ['Andrew Stanton', 'Jim Jarmusch'],
                },
              ],
            },
            {
              winner: 'Todd Haynes',
              options: [
                {
                  winner: 'Todd Haynes',
                  options: ['Todd Haynes', 'James Mangold'],
                },
                {
                  winner: 'Alex Garland',
                  options: ['Judd Apatow', 'Alex Garland'],
                },
              ],
            },
          ],
        },
        {
          winner: 'Spike Lee',
          options: [
            {
              winner: 'Spike Lee',
              options: [
                {
                  winner: 'Spike Lee',
                  options: ['Spike Lee', 'Joe Wright'],
                },
                {
                  winner: 'John Hughes',
                  options: ['John Hughes', 'Céline Sciamma'],
                },
              ],
            },
            {
              winner: 'Richard Linklater',
              options: [
                {
                  winner: 'Richard Linklater',
                  options: ['Richard Linklater', 'Joan Micklin Silver'],
                },
                {
                  winner: 'OZ/Henson',
                  options: ['OZ/Henson', 'Luca Guadagnino'],
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

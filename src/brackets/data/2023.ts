import { Data } from 'brackets/types';

// polls https://www.blankcheckpod.com/march-madness
const data: Data<0> = {
  winner: undefined,
  options: [
    {
      winner: undefined,
      options: [
        {
          winner: 'Park Chan-wook',
          options: [
            {
              winner: 'Park Chan-wook',
              options: [
                {
                  winner: 'Peter Jackson',
                  options: ['Peter Jackson', 'Pablo Larrain'],
                },
                {
                  winner: 'Park Chan-wook',
                  options: ['Park Chan-wook', 'Steve McQueen'],
                },
              ],
            },
            {
              winner: 'Peter Weir',
              options: [
                {
                  winner: 'Sergio Leone',
                  options: ['Sergio Leone', 'Mira Nair'],
                },
                {
                  winner: 'Peter Weir',
                  options: ['Peter Weir', 'Jia Zhangke'],
                },
              ],
            },
          ],
        },
        {
          winner: 'Guillermo Del Toro',
          options: [
            {
              winner: 'Guillermo Del Toro',
              options: [
                {
                  winner: 'Guillermo Del Toro',
                  options: ['Guillermo Del Toro', 'Ousmane Sembene'],
                },
                {
                  winner: 'Satoshi Kon',
                  options: ['Satoshi Kon', 'Lars Von Trier'],
                },
              ],
            },
            {
              winner: 'Baz Luhrmann',
              options: [
                {
                  winner: 'Edward Yang',
                  options: ['David Lean', 'Edward Yang'],
                },
                {
                  winner: 'Baz Luhrmann',
                  options: ['Baz Luhrmann', 'Andrei Tarkovsky'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      winner: undefined,
      options: [
        {
          winner: 'Wong Kar Wai',
          options: [
            {
              winner: 'Wong Kar Wai',
              options: [
                {
                  winner: 'Wong Kar Wai',
                  options: ['Wong Kar Wai', 'Lucrecia Martel'],
                },
                {
                  winner: 'Stephen Chow',
                  options: ['Francois Truffaut', 'Stephen Chow'],
                },
              ],
            },
            {
              winner: 'Cronenberg',
              options: [
                {
                  winner: 'Lynne Ramsay',
                  options: ['Fritz Lang', 'Lynne Ramsay'],
                },
                {
                  winner: 'Cronenberg',
                  options: ['Cronenberg', 'Milos Forman'],
                },
              ],
            },
          ],
        },
        {
          winner: 'Bong Joon-Ho',
          options: [
            {
              winner: 'Bong Joon-Ho',
              options: [
                {
                  winner: 'Bong Joon-Ho',
                  options: ['Bong Joon-Ho', 'Abbas Kiarostami'],
                },
                {
                  winner: 'Claire Denis',
                  options: ['Dutch Verhoeven', 'Claire Denis'],
                },
              ],
            },
            {
              winner: 'Alfonso Cuaron',
              options: [
                {
                  winner: 'Pedro Almodovar',
                  options: ['Pedro Almodovar', 'Mike Leigh'],
                },
                {
                  winner: 'Alfonso Cuaron',
                  options: ['Alfonso Cuaron', 'Agnes Varda'],
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

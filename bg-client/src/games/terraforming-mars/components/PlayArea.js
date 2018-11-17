import {Flex, Box} from 'grid-styled'
import Card from './Card/Card'

const PlayArea = props => (
  <Flex>
    <Box mr={1}>
      {props.game.playerState[props.player].corporation && (
        <Corporation name={props.game.playerState[props.player].corporation} collapsed />
      )}
      {props.game.playerState[props.player].played
        .slice(0, 10)
        .map(name => (
          <Card
            played
            key={name}
            name={name}
            collapsed
            resources={props.game.playerState[props.player].cardResources[name]}
          />
        ))}
    </Box>
    <Box mr={1}>
      {props.game.playerState[props.player].played
        .slice(10, 20)
        .map(name => (
          <Card
            played
            key={name}
            name={name}
            collapsed
            resources={props.game.playerState[props.player].cardResources[name]}
          />
        ))}
    </Box>
    <Box>
      {props.game.playerState[props.player].played
        .slice(20)
        .map(name => (
          <Card
            played
            key={name}
            name={name}
            collapsed
            resources={props.game.playerState[props.player].cardResources[name]}
          />
        ))}
    </Box>
  </Flex>
)

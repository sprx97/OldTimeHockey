import React from 'react';
import { Image, Segment } from 'semantic-ui-react';

const Chat = () => {
  return (
    <Segment basic>
      <center>
        <Image
          src="/images/logos/discord.png"
          as="a"
          href="https://discord.com/invite/zXTUtj9"
          target="_blank"
          alt="OTH discord"
        />
      </center>
    </Segment>
  );
};

export default Chat;

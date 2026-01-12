import { Segment } from 'semantic-ui-react';

const Updating = () => {
  return (
    <Segment basic textAlign="center" size="massive" padded="very">
      <h1 className="x-large text-primary">
        <i className="fas fa-exclamation-triangle" />
        The Site is currently updating for the week. Please check back in ~30 minutes.
      </h1>
      <img src="images/Updating.jpg" />
    </Segment>
  );
};

export default Updating;

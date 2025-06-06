import { Container, Title, Text, Box } from '@mantine/core'

const Rules = () => {
  return (
    <Container size='lg' py='xl'>
      <Title order={1} mb='lg'>
        OldTimeHockey Rules
      </Title>
      <Box mb='xl'>
        <Title order={2} mb='md'>
          General Rules
        </Title>
        <Text mb='sm'>
          This page contains the rules for OldTimeHockey leagues. Please refer
          to this page for all official rules and guidelines.
        </Text>
        <Text>
          More detailed rules content will be added here. This is a placeholder
          component for the Rules page.
        </Text>
      </Box>
    </Container>
  )
}

export default Rules

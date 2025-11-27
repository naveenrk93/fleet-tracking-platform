import { Box, Grid, GridItem, Heading, VStack, HStack, Button, Spinner, Text, Alert, AlertIcon, AlertTitle, AlertDescription, useColorMode, Progress, SimpleGrid } from "@chakra-ui/react";
import { MdDirectionsCar, MdLocalShipping, MdPeople, MdRefresh } from "react-icons/md";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { StatCard } from "../../../components/dashboard/StatCard.tsx";
import { dashboardService, type DashboardMetrics } from "../../../services/dashboardService";

export const AdminDashboard = () => {
  const { colorMode } = useColorMode();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.calculateMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Failed to load dashboard data. Please make sure the server is running.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="text.secondary">Loading dashboard data...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !metrics) {
    return (
      <Box>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          minH="200px"
          borderRadius="xl"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Failed to Load Dashboard
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {error || 'Unable to fetch dashboard metrics'}
          </AlertDescription>
          <Button
            mt={4}
            colorScheme="red"
            onClick={loadDashboardData}
            leftIcon={<MdRefresh />}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  const vehicleUtilization = metrics.totalVehicles > 0
    ? Math.round((metrics.activeVehicles / metrics.totalVehicles) * 100)
    : 0;

  const driverUtilization = metrics.totalDrivers > 0
    ? Math.round((metrics.activeDrivers / metrics.totalDrivers) * 100)
    : 0;

  const colors = {
    primary: ['#667eea', '#764ba2', '#9F7AEA', '#805AD5', '#6B46C1', '#553C9A', '#44337A'],
    status: {
      completed: '#48BB78',
      inProgress: '#4299E1',
      pending: '#F6AD55',
      failed: '#F56565'
    }
  };

  return (
    <Box>
      <VStack align="stretch" spacing={4}>
        {/* Page Header */}
        <HStack justify="space-between" align="center">
          <Heading size="lg" color="text.primary">
            Fleet Admin Dashboard
          </Heading>
          <Button
            leftIcon={<MdRefresh />}
            size="sm"
            variant="outline"
            onClick={loadDashboardData}
            isLoading={loading}
          >
            Refresh Data
          </Button>
        </HStack>

        {/* Key Metrics Row */}
        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Total Orders"
              value={metrics.totalOrders.toString()}
              icon={MdLocalShipping}
              color="blue.400"
              subtitle={`${metrics.completedOrders} completed`}
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="In Transit"
              value={metrics.inTransitOrders.toString()}
              icon={MdLocalShipping}
              color="orange.400"
              subtitle="Currently shipping"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Active Vehicles"
              value={`${metrics.activeVehicles}/${metrics.totalVehicles}`}
              icon={MdDirectionsCar}
              color="purple.400"
              subtitle={`${vehicleUtilization}% utilization`}
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Total Drivers"
              value={metrics.totalDrivers.toString()}
              icon={MdPeople}
              color="cyan.400"
              subtitle={`${metrics.activeDrivers} active`}
            />
          </GridItem>
        </Grid>

        {/* Fleet Utilization & Distribution */}
        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <Box
              bg="bg.surface"
              borderRadius="xl"
              p={5}
              border="1px solid"
              borderColor="border.default"
              _hover={{ borderColor: "border.hover", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              h="280px"
            >
              <VStack align="stretch" spacing={4} h="100%">
                <Box>
                  <Text fontSize="md" fontWeight="bold" color="text.primary">
                    Fleet Resources
                  </Text>
                  <Text fontSize="xs" color="text.secondary" mt={1}>
                    Real-time utilization
                  </Text>
                </Box>

                <SimpleGrid columns={2} spacing={3} flex={1}>
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                      {metrics.totalVehicles}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      Total Vehicles
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                      {metrics.totalDrivers}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      Total Drivers
                    </Text>
                  </Box>
                </SimpleGrid>

                <VStack align="stretch" spacing={3}>
                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="text.secondary">
                        Active Vehicles
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" color="text.primary">
                        {metrics.activeVehicles} / {metrics.totalVehicles}
                      </Text>
                    </HStack>
                    <Progress 
                      value={vehicleUtilization} 
                      size="sm" 
                      colorScheme="purple"
                      borderRadius="full"
                    />
                  </VStack>

                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="text.secondary">
                        Active Drivers
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" color="text.primary">
                        {metrics.activeDrivers} / {metrics.totalDrivers}
                      </Text>
                    </HStack>
                    <Progress 
                      value={driverUtilization} 
                      size="sm" 
                      colorScheme="blue"
                      borderRadius="full"
                    />
                  </VStack>
                </VStack>
              </VStack>
            </Box>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <Box
              bg="bg.surface"
              borderRadius="xl"
              p={5}
              border="1px solid"
              borderColor="border.default"
              _hover={{ borderColor: "border.hover", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              h="280px"
            >
              <VStack align="stretch" spacing={4} h="100%">
                <Box>
                  <Text fontSize="md" fontWeight="bold" color="text.primary">
                    Vehicle Distribution
                  </Text>
                  <Text fontSize="xs" color="text.secondary" mt={1}>
                    Fleet by type
                  </Text>
                </Box>

                <Box flex={1}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.vehicleTypeDistribution} layout="vertical">
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={colorMode === 'dark' ? '#2D3748' : '#E2E8F0'} 
                      />
                      <XAxis 
                        type="number"
                        stroke={colorMode === 'dark' ? '#A0AEC0' : '#718096'}
                        style={{ fontSize: '10px' }}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name" 
                        stroke={colorMode === 'dark' ? '#A0AEC0' : '#718096'}
                        style={{ fontSize: '10px' }}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: colorMode === 'dark' ? '#2D3748' : '#FFFFFF',
                          border: `1px solid ${colorMode === 'dark' ? '#4A5568' : '#E2E8F0'}`,
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {metrics.vehicleTypeDistribution.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors.primary[index % colors.primary.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </VStack>
            </Box>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <Box
              bg="bg.surface"
              borderRadius="xl"
              p={5}
              border="1px solid"
              borderColor="border.default"
              _hover={{ borderColor: "border.hover", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              h="280px"
            >
              <VStack align="stretch" spacing={4} h="100%">
                <Box>
                  <Text fontSize="md" fontWeight="bold" color="text.primary">
                    Delivery Status
                  </Text>
                </Box>

                <Box flex={1}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.deliveryStatusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        style={{ fontSize: '10px' }}
                      >
                        {metrics.deliveryStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: colorMode === 'dark' ? '#2D3748' : '#FFFFFF',
                          border: `1px solid ${colorMode === 'dark' ? '#4A5568' : '#E2E8F0'}`,
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Box textAlign="center">
                  <Text fontSize="xl" fontWeight="bold" color="text.primary">
                    {metrics.totalDeliveries > 0 ? Math.round((metrics.completedDeliveries / metrics.totalDeliveries) * 100) : 0}%
                  </Text>
                  <Text fontSize="xs" color="text.secondary">
                    Success Rate
                  </Text>
                </Box>
              </VStack>
            </Box>
          </GridItem>
        </Grid>

      </VStack>
    </Box>
  );
};


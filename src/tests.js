import { getOrderStatus, partnerPermissions } from './mockOrigin.js';

async function runTests() {
  console.log('=== Running Order Status Tests ===\n');

  // Test 1: Valid partner accessing their own order
  console.log('Test 1: Partner1 accessing their own order (should succeed)');
  try {
    const result = getOrderStatus('partner1', 'order123');
    console.log('✅ Success:', result);
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }

  // Test 2: Valid partner accessing another partner's order
  console.log('\nTest 2: Partner1 trying to access Partner2\'s order (should fail)');
  try {
    const result = getOrderStatus('partner1', 'order789');
    console.log('❌ Unexpected success:', result);
  } catch (error) {
    console.log('✅ Expected failure:', error.message);
  }

  // Test 3: Partner with no order access
  console.log('\nTest 3: Partner3 with no order access (should fail)');
  try {
    const result = getOrderStatus('partner3', 'order123');
    console.log('❌ Unexpected success:', result);
  } catch (error) {
    console.log('✅ Expected failure:', error.message);
  }

  // Test 4: Non-existent order
  console.log('\nTest 4: Accessing non-existent order (should fail)');
  try {
    const result = getOrderStatus('partner1', 'order999');
    console.log('❌ Unexpected success:', result);
  } catch (error) {
    console.log('✅ Expected failure:', error.message);
  }

  // Test 5: Non-existent partner
  console.log('\nTest 5: Non-existent partner (should fail)');
  try {
    const result = getOrderStatus('partner99', 'order123');
    console.log('❌ Unexpected success:', result);
  } catch (error) {
    console.log('✅ Expected failure:', error.message);
  }

  // Test 6: Simulate origin timeout (10% chance)
  console.log('\nTest 6:

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WebFooter = () => {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        © {new Date().getFullYear()} BookClubBolt. All rights reserved.
      </Text>
      {/* You can add more links or information here */}
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F3F4F6', // Light gray background
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280', // Medium gray text
  },
});

export default WebFooter;

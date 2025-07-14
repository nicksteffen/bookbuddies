import React from 'react';
import { View, Text } from 'react-native'; // Removed StyleSheet as it's no longer needed

const WebFooter = () => {
  return (
    <View
      // Converted from styles.footerContainer:
      // paddingHorizontal: 20 -> px-5
      // paddingVertical: 15 -> py-4 (closer to 16px, a common Tailwind spacing)
      // backgroundColor: '#F3F4F6' -> bg-muted (uses your theme's muted background)
      // borderTopWidth: 1 -> border-t
      // borderTopColor: '#E5E7EB' -> border-border (uses your theme's border color)
      // alignItems: 'center' -> items-center
      // justifyContent: 'center' -> justify-center
      className="px-5 py-4 bg-muted border-t border-border items-center justify-center"
    >
      <Text
        // Converted from styles.footerText:
        // fontSize: 14 -> text-sm
        // color: '#6B7280' -> text-muted-foreground (uses your theme's muted foreground color)
        className="text-sm text-muted-foreground"
      >
        © {new Date().getFullYear()} BookClubBolt. All rights reserved.
      </Text>
      {/* You can add more links or information here */}
    </View>
  );
};

export default WebFooter;
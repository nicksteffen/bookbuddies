import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Link } from 'expo-router';
import { MenuIcon, XIcon } from 'lucide-react-native';

const WebHeader = () => {
  const { width } = useWindowDimensions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const breakpoint = 768; // Adjust this breakpoint as needed (e.g., typical tablet size)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Common navigation links component
  const NavLinksContent = ({ isSidebar = false }) => (
    <>
      <Link
        href="/"
        style={isSidebar ? styles.sidebarNavLink : styles.navLink}
        onPress={() => setIsSidebarOpen(false)}
      >
        Home
      </Link>
      <Link
        href="/clubs"
        style={isSidebar ? styles.sidebarNavLink : styles.navLink}
        onPress={() => setIsSidebarOpen(false)}
      >
        Clubs
      </Link>
      <Link
        href="/library"
        style={isSidebar ? styles.sidebarNavLink : styles.navLink}
        onPress={() => setIsSidebarOpen(false)}
      >
        Library
      </Link>
      <Link
        href="/profile"
        style={isSidebar ? styles.sidebarNavLink : styles.navLink}
        onPress={() => setIsSidebarOpen(false)}
      >
        Profile
      </Link>
    </>
  );

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.appTitle}>BookClubBolt</Text>

      {width > breakpoint ? (
        // Desktop/Tablet navigation
        <View style={styles.navLinks}>
          <NavLinksContent />
        </View>
      ) : (
        // Mobile hamburger icon
        <Pressable onPress={toggleSidebar} style={styles.hamburgerIcon}>
          {isSidebarOpen ? (
            <XIcon size={24} color="#1F2937" />
          ) : (
            <MenuIcon size={24} color="#1F2937" />
          )}
        </Pressable>
      )}

      {isSidebarOpen && width <= breakpoint && (
        // Sidebar overlay (darkens background)
        <Pressable style={styles.sidebarOverlay} onPress={toggleSidebar}>
          {/* Sidebar content */}
          <View style={styles.sidebar} onStartShouldSetResponder={() => true}>
            <NavLinksContent isSidebar={true} />
          </View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    width: '100%', // Ensure it takes full width
    zIndex: 10, // Ensure header is above sidebar when it opens
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  navLinks: {
    flexDirection: 'row',
  },
  navLink: {
    marginLeft: 20,
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  // Styles for the hamburger menu
  hamburgerIcon: {
    padding: 5,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim the background
    zIndex: 1000, // Ensure it's on top of everything else
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  sidebar: {
    width: '70%', // Adjust sidebar width as needed
    maxWidth: 300, // Max width for larger screens (e.g., tablet landscape)
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 60, // Space for the header behind
    paddingHorizontal: 20,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  sidebarNavLink: {
    paddingVertical: 15,
    width: '100%', // Take full width of sidebar
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Light separator for links
  },
});

export default WebHeader;

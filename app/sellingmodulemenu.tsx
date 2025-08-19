import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SellingModuleMenu = () => {
  return (
    <View style={styles.container}>
      {/* Dashboard */}
      <Link href="/(tabs)/dashboard" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Dashboard</Text>
        </TouchableOpacity>
      </Link>

      {/* Explore */}
      {/*
      <Link href="/(tabs)/explore" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Explore</Text>
        </TouchableOpacity>
      </Link>
      */}

      {/* Item List */}
      
      <Link href="/(tabs)/itemlist" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Item List</Text>
        </TouchableOpacity>
      </Link>
      

      {/* Order List */}
      
      <Link href="/(tabs)/orderlist" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Order List</Text>
        </TouchableOpacity>
      </Link>
      

      {/* Customer List */}
      
      <Link href="/(tabs)/customerlist" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Customer List</Text>
        </TouchableOpacity>
      </Link>
      

      {/* Quotation List */}
      
      <Link href="/(tabs)/quotationlist" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Quotation List</Text>
        </TouchableOpacity>
      </Link>
      

      
      <Link href="/(tabs)/customerform" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Customer Form</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(tabs)/itemform" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Item Form</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(tabs)/quotationform" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Quotation Form</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(tabs)/salesorderform" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Sales Order Form</Text>
        </TouchableOpacity>
      </Link>
      {/* Module */}
      <Link href="/(tabs)/Module" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Module</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default SellingModuleMenu;

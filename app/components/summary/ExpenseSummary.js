import React, { Component, PropTypes } from 'react';
import firebase from 'firebase';
import { map } from 'lodash';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableHighlight,
  } from 'react-native';
import mStyles from '../../styles/main';
import Separator from '../../helpers/Separator';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  fundsAvailable: {
    fontSize: 45,
    textAlign: 'center',
  },
  categoryText: {
    color: '#51602D',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 5,
    marginBottom: 10,
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CB65E',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#9CB65E',
    alignSelf: 'center',
    textAlign: 'center',
  },
  button: {
    height: 40,
    width: 285,
    marginLeft: 20,
    marginTop: 5,
    marginBottom: 5,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderColor: '#393E46',
    borderWidth: 0.5,
    borderRadius: 8,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
  },
  expenses: {
    marginLeft: 60,
  },
  expenseText: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'left',
    color: '#51602D',
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderBottomWidth: 10,
    borderColor: '#9CB65E',
    borderRadius: 8,
    height: 50,
    padding: 4,
    marginRight: 15,
    marginLeft: 20,
    marginBottom: 10,
    fontSize: 23,
    color: '#51602D',
  },
  inputButton: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#B2C777',
    borderColor: '#ffffff',
    borderWidth: 0.5,
    borderRadius: 8,
    marginTop: 10,
    marginRight: 15,
    justifyContent: 'center',
  },
});

class ExpenseSummary extends Component {
  constructor() {
    super();

    this.state = {
      data: null,
      user: null,
      recurringData: null,
      expenseData: null,
      title: '',
      dollar: '',
    };
  }

  componentDidMount() {
    const user = this.props.user;
    firebase.database().ref(`users/${user.uid}`).on('value', (snapshot) => {
      const data = snapshot.val() || 0;
      this.setExpenses(data);
    });
  }


  componentWillUnmount() {
    const user = this.props.user;
    firebase.database().ref(`users/${user.uid}/expenses`).off();
  }

  setExpenses(data) {
    const recurringMap = map(data.recurring, (value, prop) => ({ prop, value }));
    const expenseMap = map(data.expenses, (value, prop) => ({ prop, value }));
    this.setState({
      recurringData: recurringMap,
      expenseData: expenseMap,
    });
  }

  handleTitleChange(input) {
    this.setState(
      {
        title: input,
      }
    );
  }

  handleDollarChange(input) {
    const number = parseInt(input, 10);
    this.setState(
      {
        dollar: number,
      }
    );
  }

  addExpenseToDataBase() {
    const { user } = this.props;
    const { title, dollar } = this.state;
    firebase.database().ref(`users/${user.uid}/expenses`).push(
      {
        title,
        dollar,
      });

    this.setState({
      title: '',
      dollar: '',
    });
  }

  renderRecurring() {
    const { recurringData } = this.state;
    const expenses = map(recurringData, (item) => {
      return (
        <TouchableHighlight key={item.prop} style={styles.button}>
          <Text style={styles.buttonText}>
            {item.prop} ${item.value}
          </Text>
        </TouchableHighlight>
      );
    });
    return expenses;
  }

  renderExpenses() {
    const { expenseData } = this.state;
    const expenses = map(expenseData, (item) => {
      return (
        <View key={item.prop} style={styles.expenses}>
          <Text style={styles.expenseText}>
            {item.value.title} - ${item.value.dollar}
          </Text>
          <Separator />
        </View>
      );
    });
    return expenses;
  }

  render() {
    return (
      <ScrollView>
        <View style={styles.container}>
          <Text style={mStyles.title}>Life Expenses</Text>
          <Separator />
          <Text style={styles.categoryText}>Add/Edit Expenses</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={this.state.title}
            onChangeText={input => this.handleTitleChange(input)}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="$"
              value={this.state.dollar}
              onChangeText={input => this.handleDollarChange(input)}
            />
            <TouchableHighlight
              style={styles.inputButton}
              underlayColor="#9CB65E"
              onPress={() => this.addExpenseToDataBase()}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableHighlight>
          </View>
          <Separator />

          <Text style={styles.categoryText}> Recurring </Text>
          {this.renderRecurring()}
          <Separator />

          <Text style={styles.categoryText}> Other Expenses </Text>
          {this.renderExpenses()}
        </View>
      </ScrollView>
    );
  }
}

ExpenseSummary.propTypes = {
  user: PropTypes.object.isRequired,
};

export default ExpenseSummary;

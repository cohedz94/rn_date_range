/**
 * Created by TinySymphony on 2017-05-11.
 */

import React, { PropTypes, PureComponent } from 'react';
import {
    // View,
    // Text,
    // // ListView,
    FlatList,
    Dimensions
} from 'react-native';
import Moment from 'moment';
import styles from 'react-native-calendar-select/CalendarStyle';
import Month from 'react-native-calendar-select/Month';
const { width } = Dimensions.get('window');
export default class MonthList extends PureComponent {
    constructor(props) {
        super(props);
        this.monthList = [];
        this.state = {
            data: this._getMonthList()
        };
        this._renderMonth = this._renderMonth.bind(this);
        this._shouldUpdate = this._shouldUpdate.bind(this);
        this._checkRange = this._checkRange.bind(this);
        this._getWeekNums = this._getWeekNums.bind(this);
        this._scrollToSelecetdMonth = this._scrollToSelecetdMonth.bind(this);
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        let isDateUpdated = ['startDate', 'endDate', 'minDate', 'maxDate'].reduce((prev, next) => {
            if (prev || nextProps[next] !== this.props[next]) {
                return true;
            }
            return prev;
        }, false);
        if (isDateUpdated) {
            this.setState({
                data: this._getMonthList(nextProps)
            });
        }
    }
    _renderMonth({ item, index }) {
        return (<Month month={item.date || {}} {...this.props} />
        );
    }
    _checkRange(date, start, end) {
        if (!date || !start) return false;
        if (!end) return date.year() === start.year() && date.month() === start.month();
        if (date.year() < start.year() || (date.year() === start.year() && date.month() < start.month())) return false;
        if (date.year() > end.year() || (date.year() === end.year() && date.month() > end.month())) return false;
        return true;
    }
    _shouldUpdate(month, props) {

        if (!props) return false;
        const {
            startDate,
            endDate
        } = props;
        const {
            date
        } = month;
        let next = this._checkRange(date, startDate, endDate);
        let prev = this._checkRange(date, this.props.startDate, this.props.endDate);
        if (prev || next) return true;
        return false;
    }
    _getMonthList(props) {
        let minDate = (props || this.props).minDate.clone().date(1);
        let maxDate = (props || this.props).maxDate.clone();
        let monthList = [];
        if (!maxDate || !minDate) return monthList;
        while (maxDate > minDate || (
            maxDate.year() === minDate.year() &&
            maxDate.month() === minDate.month()
        )) {
            let month = {
                date: minDate.clone()
            };
            month.shouldUpdate = this._shouldUpdate(month, props);
            monthList.push(month);
            minDate.add(1, 'month');
        }
        return monthList;
    }
    _getWeekNums(start, end) {
        let clonedMoment = Moment(start),
            date, day, num, y, m, total = 0;
        while (!clonedMoment.isSame(end, 'months')) {
            y = clonedMoment.year();
            m = clonedMoment.month();
            date = new Date(y, m, 1);
            day = date.getDay();
            num = new Date(y, m + 1, 0).getDate();
            total += Math.ceil((num + day) / 7);
            clonedMoment.add(1, 'months');
        }
        return total;
    }
    _scrollToSelecetdMonth() {
        const {
            startDate,
            minDate
        } = this.props;
        let monthOffset = 12 * (startDate.year() - minDate.year()) +
            startDate.month() - minDate.month();
        let weekOffset = this._getWeekNums(minDate, startDate);
        setTimeout(() => {
            this.list.scrollToOffset({
                animated: true,
                offset: monthOffset * (24 + 25) + (monthOffset ? weekOffset * Math.ceil(width / 7 + 10) : 0),
            })
        }, 400);
    }
    componentDidMount() {
        this.props.startDate && this._scrollToSelecetdMonth();
    }
    render() {

        return (<FlatList
            data={this.state.data}
            ref={
                (list) => { this.list = list; }
            }
            keyExtractor={
                el => el.date
            }
            style={styles.scrollArea}
            initialNumToRender={2}
            showsVerticalScrollIndicator={false}
            renderItem={this._renderMonth}
        />
        );
    }
}
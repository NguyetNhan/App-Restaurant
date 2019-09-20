import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { urlServer, background } from '../../config';
import { AccountModel } from '../../models/account';
import ItemListOrderAdminRestaurant from './item_list_order_admin_restaurant';
import ItemListOrderClient from './item_list_order_client';
export default class Deal extends Component {
        constructor (props) {
                super(props);
                this.state = {
                        account: null,
                        isLoading: false,
                        listOrder: [],
                        page: 1,
                        total_page: null,
                        isRefresh: false,
                        isLoadMore: false
                };
                this._onClickOrder = this._onClickOrder.bind(this);
        }


        async _getInfoAccountFromLocal () {
                const account = await AccountModel.FetchInfoAccountFromDatabaseLocal();
                if (account.authorities === 'admin-restaurant') {
                        this.setState({
                                account: account,
                                isLoading: true,
                        });
                        this.props.onFetchListOrder({
                                data: {
                                        idAdmin: account.id,
                                        page: 1,
                                },
                                type: 'admin-restaurant'
                        });
                } else if (account.authorities === 'client') {
                        this.setState({
                                account: account,
                                isLoading: true,
                        });
                        this.props.onFetchListOrder({
                                data: {
                                        idClient: account.id,
                                        page: 1,
                                },
                                type: 'client'
                        });
                }

        }

        componentDidMount () {
                this._getInfoAccountFromLocal();
        }

        static getDerivedStateFromProps (nextProps, prevState) {
                if (nextProps.listOrder !== prevState.listOrder && nextProps.listOrder !== undefined && prevState.isRefresh && !prevState.isLoadMore) {
                        prevState.isRefresh = false;
                } else if (nextProps.listOrder !== prevState.listOrder && nextProps.listOrder !== undefined && !prevState.isRefresh && !prevState.isLoadMore) {
                        prevState.listOrder = nextProps.listOrder;
                } else if (nextProps.listOrder !== prevState.listOrder && nextProps.listOrder !== undefined && !prevState.isRefresh && prevState.isLoadMore) {
                        prevState.listOrder = prevState.listOrder.concat(nextProps.listOrder);
                        prevState.isLoadMore = false;
                }
                if (nextProps.page !== prevState.page && nextProps.page !== undefined) {
                        prevState.page = nextProps.page;
                }
                if (nextProps.total_page !== prevState.total_page && nextProps.total_page !== undefined) {
                        prevState.total_page = nextProps.total_page;
                }
                if (nextProps.isLoading !== prevState.isLoading) {
                        prevState.isLoading = nextProps.isLoading;
                }
                return null;
        }

        _onClickOrder (idOrder) {
                this.props.navigation.navigate('DetailDeal', {
                        idOrder: idOrder
                });
        }

        _onRefreshListOrder () {
                this.setState({
                        page: 1,
                        listOrder: [],
                        isLoading: true,
                        isRefresh: true
                });
                const authorities = this.state.account.authorities;
                if (authorities === 'admin-restaurant') {
                        this.props.onFetchListOrder({
                                data: {
                                        idAdmin: this.state.account.id,
                                        page: 1
                                },
                                type: 'admin-restaurant'
                        });
                } else if (authorities === 'client') {
                        this.props.onFetchListOrder({
                                data: {
                                        idClient: this.state.account.id,
                                        page: 1,
                                },
                                type: 'client'
                        });
                }
        }

        _onLoadMoreListOrder () {
                const page = this.state.page;
                const total_page = this.state.total_page;
                if (page < total_page) {
                        const authorities = this.state.account.authorities;
                        if (authorities === 'admin-restaurant') {
                                this.props.onFetchListOrder({
                                        data: {
                                                idAdmin: this.state.account.id,
                                                page: page + 1
                                        },
                                        type: 'admin-restaurant'
                                });
                        } else if (authorities === 'client') {
                                this.props.onFetchListOrder({
                                        data: {
                                                idClient: this.state.account.id,
                                                page: page + 1
                                        },
                                        type: 'client'
                                });
                        }
                        this.setState({
                                isLoading: true,
                                isLoadMore: true
                        });
                }
        }

        componentWillUnmount () {
                this.props.onResetProps();
        }
        render () {
                return (
                        <View style={styles.container}>
                                <StatusBar
                                        backgroundColor='white'
                                        barStyle='dark-content'
                                />
                                <View style={styles.containerHeader}>
                                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                                                <Icon name='arrowleft' size={25} color='black' />
                                        </TouchableOpacity>
                                        <Text style={styles.textHeader}>đơn hàng</Text>
                                        <View />
                                </View>
                                <View style={styles.content}>
                                        <FlatList
                                                data={this.state.listOrder}
                                                extraData={this.state}
                                                keyExtractor={(item, index) => index.toString()}
                                                refreshing={this.state.isLoading}
                                                onRefresh={() => {
                                                        this._onRefreshListOrder();
                                                }}
                                                onEndReached={() => {
                                                        this._onLoadMoreListOrder();
                                                }}
                                                onEndReachedThreshold={0.1}
                                                renderItem={(item) => {
                                                        if (this.state.account.authorities === 'admin-restaurant') {
                                                                return (
                                                                        <ItemListOrderAdminRestaurant
                                                                                item={item.item}
                                                                                _onClickOrder={this._onClickOrder}
                                                                        />
                                                                );
                                                        } else if (this.state.account.authorities === 'client') {
                                                                return (
                                                                        <ItemListOrderClient
                                                                                item={item.item}
                                                                                _onClickOrder={this._onClickOrder}
                                                                        />
                                                                );
                                                        }

                                                }}
                                        />
                                </View>
                        </View>
                );
        }
}

const styles = StyleSheet.create({
        container: {
                flex: 1
        },
        containerHeader: {
                width: '100%',
                height: 50,
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 20
        },
        textHeader: {
                fontFamily: 'UVN-Baisau-Bold',
                fontSize: 20,
                textTransform: 'capitalize'
        },
        content: {
                flex: 1,
                backgroundColor: background
        }
});
<template>
  <div class="w3-content-midx">
    <InnerNavbar/>
        <Loader v-if="isLoading" />
        <div v-else>
            <div class="w3-center" style="margin-top: 50px" v-if="!Array.isArray(logs) || !logs.length">
                No logs received yet.
                <hr class="hr">
            </div>
            <div class="w3-content-mid" v-else>
                <table class="w3-table" >
                    <tr>
                        <th>
                            S/N
                        </th>
                        <th>
                            Account Name
                        </th>
                        <th>
                            Account Number
                        </th>
                        <th>
                            Bank
                        </th>
                        <th>
                            Currency
                        </th>
                        <th>
                            Balance
                        </th>
                        <th>
                            Type
                        </th>
                        <th>
                            BVN
                        </th>
                        <th>
                            Last Sync Update
                        </th>
                        <th>
                            Transactions
                        </th>
                    </tr>

                    <tr v-for="(log, index) in logs" :key="log._id" >
                        <td>
                            {{ index+1 }}
                        </td>
                        <td>
                            {{ log.accountName }}
                        </td>
                        <td>
                            {{ log.accountNumber }}
                        </td>
                        <td>
                            {{ log.bank }}
                        </td>
                        <td>
                            {{ log.currency }}
                        </td>
                        <td>
                            {{ (Number(log.balance)/100).toLocaleString() }}
                        </td>
                        <td>
                            {{ log.type }}
                        </td>
                        <td>
                            {{ log.bvn }}
                        </td>
                        <td>
                            {{ moment(log.lastUpdatedTime).format('LLL') }}
                        </td>
                        <td>
                            <span class="underline" @click="show(log._id, log.groupId)">View</span>
                        </td>

                        <!-- ------- -->
                        <modal :name="log._id"  scrollable="true" height="auto" @before-close="beforeModalCloses">
                            <div class="w3-padding-large">
                                <b>LOGGED TRANSACTIONS AS AT LAST UPDATED</b>
                                <hr>

                                <Loader v-if="isTransactionsLoading" />
                                <div v-else>
                                    <div v-for="(transaction, index2) in transactions" :key="transaction._id" >

                                        <b>{{ index2+1 }}. Reference: </b> {{ transaction.narration }}
                                        <br>
                                        <b>Amount:</b> #{{ (Number(transaction.amount)/100).toLocaleString() }}
                                        <br>
                                        <b>Transaction Date:</b> {{ moment(transaction.date).format('LLL') }}
                                        <br>
                                        <b>Transaction Type: </b>
                                        {{ transaction.type }}

                                        <hr>
                                    </div>
                                </div>
                                
                            </div>
                        </modal>
                        <!-- ------- -->
                    </tr>
                    
                </table>
                
            </div>
            
        </div>

        <!-- <button @click="show()">
            hey
        </button> -->

        
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import InnerNavbar from '../components/InnerNavbar.vue'
import Loader from '../components/Loader.vue'

export default {
    name: 'Logs',
    data() {
        return{
            data: null,
            isLoading: true,
            isTransactionsLoading: true
        }
    },
    components: {
        InnerNavbar,
        Loader
    },
    methods: {
        ...mapActions('services', ['getLogs', 'getTransactions']),
        ...mapMutations('services', ['clear_transaction_data']),
        show (id, groupId) {
            this.$modal.show(id);
            
            this.getTransactions(groupId)
                .then(res => { 
                    this.isTransactionsLoading = false
                })
                .catch((err) => { this.isTransactionsLoading = false })
        },
        hide (id) {
            this.$modal.hide(id);
        },
        beforeModalCloses (event) {
            console.log(event);
            this.clear_transaction_data();
            this.isTransactionsLoading = true;
        }
    },
    created: function () {
      this.getLogs()
      .then(res => { this.isLoading = false })
      .catch((err) => { this.isLoading = false })
    },
    mount () {
        this.show()
    },
    computed: {
        ...mapState('services', ['accounts', 'logs', 'transactions']),
        ...mapGetters('auth', ['user', ]),
    },
}
</script>

<style>
.hr{
    border: none;
}

button{
    border: none;
}
.mono-button{
    width: 200px;
}
.underline{
    text-decoration: underline;
}
</style>
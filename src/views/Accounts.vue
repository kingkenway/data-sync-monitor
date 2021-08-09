<template>
  <div class="w3-content-midx">
    <InnerNavbar/>
        <Loader v-if="isLoading" />
        <div v-else>
            <div class="w3-center" style="margin-top: 50px" v-if="!Array.isArray(accounts) || !accounts.length">
                No account linked yet.
                <hr class="hr">
                <img @click="launchMono({reauthorise: false, reauthToken:''})" class="mono-button" src="@/assets/connect_button.png" alt="">
                <!-- <button class="w3-button w3-black w3-hover-black" @click="launchMono">
                    + Add Account
                </button> -->
            </div>
            <div class="w3-contentx" v-else>
                <img @click="launchMono({reauthorise: false, reauthToken:''})" class="mono-button w3-margin-left" src="@/assets/connect_button.png" alt="">
                <LoaderMin v-if="mainLoader" />

                <div class="w3-margin-left w3-margin" v-if="reauthCount">
                    <span class="w3-red w3-badge">{{reauthCount}}</span> accounts needs to be re-authorised.
                </div>

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
                            SYNC
                        </th>
                        <th>
                            REAUTH STATUS
                        </th>

                        
                    </tr>

                    <tr v-for="(account, index) in accounts" :key="account._id" >
                        <td>
                            {{ index+1 }}
                        </td>
                        <td>
                            {{ account.accountName }}
                        </td>
                        <td>
                            {{ account.accountNumber }}
                        </td>
                        <td>
                            {{ account.bank }}
                        </td>
                        <td>
                            {{ account.currency }}
                        </td>
                        <td>
                            {{ (Number(account.balance)/100).toLocaleString() }}
                        </td>
                        <td>
                            {{ account.type }}
                        </td>
                        <td>
                            {{ account.bvn }}
                        </td>
                        <td>
                            <span class="w3-black w3-padding-small" @click="triggerSync(account.accountId)">Trigger</span>
                        <td>
                            <span class="w3-red w3-padding-small w3-round" v-if="account.reauthRequired" @click="reauthorise(account.accountId)">NOT OK - Reauthorise</span>
                            <span class="w3-green w3-padding-small w3-round" v-else>OK</span>
                        </td>
                    </tr>
                    
                </table>

                <LoaderMin v-if="mainLoader" />
                
            </div>
            
        </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import InnerNavbar from '../components/InnerNavbar.vue'
import Loader from '../components/Loader.vue'
import LoaderMin from '../components/LoaderMin.vue'

export default {
    name: 'Accounts',
    data() {
        return{
            data: null,
            // reauthCount: 0,
            orders: "",
            isLoading: true,
            mainLoader: false,
            notificationSystem: {
                options: {
                    error: {
                        position: "bottomRight"
                    },
                }
            },
        }
    },
    components: {
        InnerNavbar,
        Loader,
        LoaderMin
    },
    methods: {
        ...mapActions('services', ['addAccount', 'getAccounts','fetchAccountId', 'initiateDataSync', 'initiateReauthorisation']),
        ...mapMutations('services', ['update_account_reauth_status']),
        launchMono({reauthorise, reauthToken}) {
            // this.mainLoader = true;

            self = this;
            const connect = new Connect({
                key: process.env.VUE_APP_ENV_MONO_PUBLIC_KEY,
                onSuccess: ({code}) => {
                    self.mainLoader = true;
                    // Fetch account id and information with token on account endpoint
                    self.fetchAccountId(code)
                        .then(response => {

                            // Ensure unique accounts
                            let accountFound = self.accounts.find(o => o.accountNumber === response.data.account.accountNumber);

                            if (accountFound){
                                this.$toast.error(`${response.data.account.institution.name} Account already connected.`, 'Message:', this.notificationSystem.options.error)

                            }else{
                                // Add account to DB
                                console.log("Add account to DB");
                                console.log(response.data);
                                self.addAccount({
                                    userId: self.user.id,
                                    accountId: response.data.account._id,
                                    accountName: response.data.account.name || "n/a",
                                    accountNumber: response.data.account.accountNumber || "n/a",
                                    balance: `${response.data.account.balance}` || "n/a",
                                    currency: response.data.account.currency || "n/a",
                                    bank: response.data.account.institution.name || "n/a",
                                    type: response.data.account.type || "n/a",
                                    bvn: response.data.account.bvn || "n/a",
                                    // bvn: response.data.account.bvn == null ? "n/a" : response.data.account.bvn,
                                })
                            }

                            self.mainLoader = false;

                        })
                },
                onLoad: () => console.log("widget loaded successfully"),
                onClose: () => {
                    // this.mainLoader = false;
                    console.log("widget has been closed");
                },
                onEvent: (eventName, data) => {
                    console.log(eventName);
                    console.log(data);
                },
                reference: "random_ref_string"
            });

            if (reauthorise) {
                connect.reauthorise(reauthToken);
            }else{
                connect.setup();
            }

            connect.open();
            // return connect;
        },

        triggerSync(accountId){
            this.mainLoader = true;

            this.initiateDataSync(accountId)
                .then(res => { 
                    this.mainLoader = false;
                    console.log('Inside initiateDataSync handler>>>>>');
                    console.log(res.data);
                    if (res.data.message == "SYNC_SUCCESSFUL") {
                        this.$toast.success('Account synced successfully.', 'Message:', this.notificationSystem.options.success)
                    }else if(res.data.message == "REAUTHORISATION_REQUIRED"){
                        // Update account state of reauth to True
                        this.update_account_reauth_status(accountId)

                        this.$toast.error(res.data.message2 || `Account not synced. Re-authorisation required!`, 'Message:', this.notificationSystem.options.error)
                    }else{
                        this.$toast.error(res.data.message2 || 'Sync Error. Please try again later.', 'Message:', this.notificationSystem.options.error)
                    }


                })
                .catch((err) => {  })
        },

        reauthorise(accountId){

            this.mainLoader = true;

            this.initiateReauthorisation(accountId)
                .then(res => {
                    console.log(res.data.message);
                    this.mainLoader = false 
                    this.launchMono({reauthorise:true, reauthToken: res.data.message})
                })
                .catch((err) => {
                    console.log('Error>>> '+err.response.data.message);
                    this.$toast.error(err.response.data.message, 'Message:', this.notificationSystem.options.error)
                    this.mainLoader = false
                })

            console.log(111);
        },

        reloadPage(){
            this.$router.go(0);
        }

    },
    created: function () {
        // this.$toast.error("Hi", 'Error:', this.notificationSystem.options.success)
        // this.$toast.success(`"${this.formData.title}" added to issues.`, 'Issue Created', this.notificationSystem.options.success)
    
        this.getAccounts()
            .then(res => { this.isLoading = false })
            .catch((err) => { this.isLoading = false })
    
        console.log(this.accounts);

        // this.reauthCount = this.accounts.filter(item => item.reauthRequired === true).length;




  },
  computed: {
    ...mapState('services', ['accounts']),
    ...mapGetters('auth', ['user', ]),
    statusStat: function(){
        return ["STANDING", "CANCELLED", "PAYMENT_MADE", "DELIVERED"]
    },
    reauthCount: function () {
      // `this` points to the vm instance
      return this.accounts.filter(item => item.reauthRequired === true).length;
    }
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
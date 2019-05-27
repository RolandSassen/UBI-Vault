package com.thinsia.ubivault.overview

import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProviders
import com.thinsia.ubivault.R
import com.thinsia.ubivault.repository.PreferencesRepository
import com.thinsia.ubivault.util.EventObserver

class OverviewFragment : Fragment() {

    companion object {
        fun newInstance() = OverviewFragment()
    }

    private lateinit var viewModel: OverviewViewModel

    private lateinit var binding: com.thinsia.ubivault.databinding.OverviewFragmentBinding

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        binding = com.thinsia.ubivault.databinding.OverviewFragmentBinding.inflate(inflater, container, false)
        return binding.root
    }

    private fun showInfo() {
        val builder = CustomTabsIntent.Builder()
        builder.setToolbarColor(ContextCompat.getColor(context!!, R.color.colorPrimaryDark))
        builder.enableUrlBarHiding()
        val customTabsIntent = builder.build()
        customTabsIntent.launchUrl(context!!, Uri.parse("https://www.ubi-vault.com/info"))
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProviders.of(this).get(OverviewViewModel::class.java)
        viewModel.showInfo.observe(this, EventObserver {
            showInfo()
        })
        binding.viewModel = viewModel
        binding.lifecycleOwner = viewLifecycleOwner
    }

    override fun onResume() {
        super.onResume()
        val account = PreferencesRepository.getAccount()
        viewModel.setAccount(account)
    }

}
